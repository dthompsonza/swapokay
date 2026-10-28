import { CollectibleItem } from './models';

export interface SwapEntry {
  item: CollectibleItem;
  quantity: number;
}

export interface SwapResult {
  give: SwapEntry[];
  receive: SwapEntry[];
  swaps: number;
}

export function computeSwap(items: readonly CollectibleItem[], mine: readonly number[], theirs: readonly number[]): SwapResult {
  const give: SwapEntry[] = [];
  const receive: SwapEntry[] = [];
  items.forEach((item, i) => {
    const m = mine[i] ?? 0;
    const t = theirs[i] ?? 0;
    if (m > 1 && t === 0) give.push({ item, quantity: m - 1 });
    if (t > 1 && m === 0) receive.push({ item, quantity: t - 1 });
  });
  return { give, receive, swaps: Math.min(give.length, receive.length) };
}
