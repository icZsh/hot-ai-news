import type { Prisma } from "@prisma/client";

export function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  if (value === undefined) {
    return {};
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function toNullablePrismaJson(
  value: unknown,
): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
