const COUNT = 48;

export const COLLECTION_ICONS: readonly string[] = Array.from(
  { length: COUNT },
  (_, i) => String(i + 1).padStart(2, '0'),
);

export function iconPath(icon: string): string {
  return `images/collection-icons/${icon}.svg`;
}

export function isValidIcon(icon: string): boolean {
  return COLLECTION_ICONS.includes(icon);
}

export function randomIcon(): string {
  return COLLECTION_ICONS[Math.floor(Math.random() * COLLECTION_ICONS.length)];
}
