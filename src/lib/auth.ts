import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function requirePrivateAccess(request: NextRequest): NextResponse | null {
  if (allowsLocalPrivateAccess(request)) {
    return null;
  }

  const secrets = [process.env.ADMIN_TOKEN, process.env.CRON_SECRET].filter(
    Boolean,
  );

  if (secrets.length === 0) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    return NextResponse.json(
      { error: "Private write guard is not configured." },
      { status: 500 },
    );
  }

  const provided =
    request.headers.get("x-admin-token") ??
    request.headers.get("x-cron-secret") ??
    parseBearerToken(request.headers.get("authorization"));

  if (provided && secrets.includes(provided)) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function allowsLocalPrivateAccess(request: NextRequest): boolean {
  if (process.env.LOCAL_PRIVATE_ACCESS !== "true") {
    return false;
  }

  const hostnames = [
    request.nextUrl.hostname,
    getHostnameFromHeader(request.headers.get("host")),
    getHostnameFromHeader(request.headers.get("x-forwarded-host")),
  ].filter((hostname): hostname is string => Boolean(hostname));

  return hostnames.some(isPrivateAccessHostname);
}

function isPrivateAccessHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "::1" || hostname.endsWith(".local")) {
    return true;
  }

  if (isPrivateIpv4(hostname)) {
    return true;
  }

  const lowerHostname = hostname.toLowerCase();
  return lowerHostname.startsWith("fc") || lowerHostname.startsWith("fd") || lowerHostname.startsWith("fe80");
}

function getHostnameFromHeader(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("[")) {
    return trimmed.slice(1, trimmed.indexOf("]"));
  }

  return trimmed.split(":")[0] ?? null;
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 10 ||
    first === 127 ||
    first === 192 && second === 168 ||
    first === 172 && second >= 16 && second <= 31 ||
    first === 100 && second >= 64 && second <= 127 ||
    first === 169 && second === 254
  );
}

function parseBearerToken(value: string | null): string | null {
  if (!value?.startsWith("Bearer ")) {
    return null;
  }

  return value.slice("Bearer ".length).trim();
}
