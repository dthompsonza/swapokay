export interface KindSummary {
  code: string;
  name: string;
  file: string;
  image: string;
  imageWidths: number[];
}

export interface CollectibleItem {
  code: string;
  name: string;
  description: string;
  variant?: string;
  image: string;
  icon: string;
}

export function itemLabel(item: CollectibleItem): string {
  return item.variant ? `${item.name} (${item.variant.charAt(0)}${item.variant.slice(1).toLowerCase()})` : item.name;
}

export interface CollectibleKind {
  code: string;
  name: string;
  items: CollectibleItem[];
}

export interface StoredCollection {
  kind: string;
  name: string;
  data: string;
  icon: string;
  updated: string;
}
