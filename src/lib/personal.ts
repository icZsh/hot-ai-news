export const bookmarkStatuses = [
  "unread",
  "read",
  "research_later",
  "used_in_brief",
  "archived",
] as const;

export type BookmarkStatus = (typeof bookmarkStatuses)[number];

export function getStatusLabel(status?: string): string {
  switch (status) {
    case "read":
      return "已读";
    case "research_later":
      return "待研究";
    case "used_in_brief":
      return "已用于简报";
    case "archived":
      return "归档";
    case "unread":
    default:
      return "未读";
  }
}
