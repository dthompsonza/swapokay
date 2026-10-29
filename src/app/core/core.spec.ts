import { base64ToCounts, countsToBase64, decodeCollection, encodeCollection, validateName } from './collection-codec';
import { computeSwap } from './swap-diff';
import { CollectibleItem } from './models';

describe('codec', () => {
  it('encodes 3 items with 10 of the second as bytes 00 0A 00', () => {
    expect(countsToBase64([0, 10, 0])).toBe('AAoA');
    expect(base64ToCounts('AAoA')).toEqual([0, 10, 0]);
  });

  it('round-trips a collection string', () => {
    const counts = Array.from({ length: 50 }, (_, i) => i * 5);
    const text = encodeCollection('CHK2026', 'My Stickers', counts);
    expect(text.startsWith('CHK2026^My Stickers^')).toBe(true);
    const r = decodeCollection(text, 'CHK2026', 50);
    expect(r.ok && r.value.counts).toEqual(counts);
  });

  it('rejects wrong kind, bad shape, corrupt data and wrong length', () => {
    const text = encodeCollection('CHK2026', 'A', [1, 2, 3]);
    expect(decodeCollection(text, 'OTHER', 3).ok).toBe(false);
    expect(decodeCollection('nope', 'CHK2026', 3).ok).toBe(false);
    expect(decodeCollection('CHK2026^A^!!!!', 'CHK2026', 3).ok).toBe(false);
    expect(decodeCollection(text, 'CHK2026', 50).ok).toBe(false);
  });

  it('validates names', () => {
    expect(validateName('')).not.toBeNull();
    expect(validateName('a'.repeat(31))).not.toBeNull();
    expect(validateName('bad^name')).not.toBeNull();
    expect(validateName('My List 2')).toBeNull();
    expect(validateName('my list', ['My List'])).not.toBeNull();
  });
});

describe('computeSwap', () => {
  const items: CollectibleItem[] = ['A', 'B', 'C', 'D'].map((c) => ({ code: c, name: c, description: c, image: '', icon: '' }));

  it('keeps one spare and only trades missing items', () => {
    const r = computeSwap(items, [3, 1, 0, 2], [0, 0, 4, 1]);
    expect(r.give.map((e) => [e.item.code, e.quantity])).toEqual([['A', 2]]);
    expect(r.receive.map((e) => [e.item.code, e.quantity])).toEqual([['C', 3]]);
    expect(r.swaps).toBe(1);
  });
});
