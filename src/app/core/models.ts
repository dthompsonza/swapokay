export interface KindSummary {
  code: string;
  name: string;
  file: string;
}

export interface CollectibleItem {
  code: string;
  name: string;
  description: string;
  image: string;
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
  updated: string;
}
