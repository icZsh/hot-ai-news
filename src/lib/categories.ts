import type { AihotCategory } from "@/lib/aihot/types";

export const categories: Array<{ value: "all" | AihotCategory; label: string }> =
  [
    { value: "all", label: "全部" },
    { value: "ai-models", label: "模型" },
    { value: "ai-products", label: "产品" },
    { value: "industry", label: "行业" },
    { value: "paper", label: "论文" },
    { value: "tip", label: "技巧" },
  ];

export function getCategoryLabel(value?: string): string {
  return categories.find((category) => category.value === value)?.label ?? "未分类";
}
