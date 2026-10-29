import { isValidIcon } from './collection-icons';

export const NAME_MAX = 30;
export const DEFAULT_NAME = 'My Collection';
export const COUNT_MIN = 0;
export const COUNT_MAX = 255;
const SEP = '^';
const NAME_PATTERN = /^[A-Za-z0-9 ]+$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) return COUNT_MIN;
  return Math.min(COUNT_MAX, Math.max(COUNT_MIN, Math.trunc(value)));
}

/** Returns an error message, or null when the name is valid. `existing` are names already used in the kind. */
export function validateName(raw: string, existing: readonly string[] = []): string | null {
  const name = raw.trim();
  if (name.length === 0) return 'Enter a name.';
  if (name.length > NAME_MAX) return `Name can be at most ${NAME_MAX} characters.`;
  if (!NAME_PATTERN.test(name)) return 'Only letters, numbers and spaces are allowed.';
  const lower = name.toLowerCase();
  if (existing.some((e) => e.toLowerCase() === lower)) return 'You already have a collection with this name.';
  return null;
}

export function countsToBase64(counts: readonly number[]): string {
  let binary = '';
  for (const c of counts) binary += String.fromCharCode(clampCount(c));
  return btoa(binary);
}

export function base64ToCounts(data: string): number[] | null {
  if (data.length % 4 !== 0 || !BASE64_PATTERN.test(data)) return null;
  try {
    const binary = atob(data);
    return Array.from(binary, (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

export function encodeCollection(kind: string, name: string, counts: readonly number[], icon?: string): string {
  const parts = [kind, name, countsToBase64(counts)];
  if (icon) parts.push(icon);
  return parts.join(SEP);
}

export interface DecodedCollection {
  kind: string;
  name: string;
  counts: number[];
  icon: string | null;
}

export function decodeCollection(text: string, expectedKind: string, itemCount: number): Result<DecodedCollection> {
  const parts = text.trim().split(SEP);
  if (parts.length !== 3 && parts.length !== 4) return { ok: false, error: 'This is not a valid collection code.' };
  const [kind, name, data, icon = null] = parts;
  if (kind !== expectedKind) {
    return { ok: false, error: `This collection is for "${kind}", not "${expectedKind}". You can only compare collections of the same kind.` };
  }
  if (validateName(name) !== null) return { ok: false, error: 'The collection name in this code is invalid.' };
  const counts = base64ToCounts(data);
  if (!counts) return { ok: false, error: 'The collection data in this code is corrupt.' };
  if (counts.length !== itemCount) return { ok: false, error: 'The collection data does not match this kind.' };
  if (icon !== null && !isValidIcon(icon)) return { ok: false, error: 'The collection icon in this code is invalid.' };
  return { ok: true, value: { kind, name, counts, icon } };
}
