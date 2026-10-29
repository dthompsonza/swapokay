const COUNT = 50;

export const COLLECTION_ICONS: readonly string[] = Array.from(
  { length: COUNT },
  (_, i) => `line-design-${String(i + 1).padStart(2, '0')}.svg`,
);

export function iconPath(icon: string): string {
  return `images/collection-icons/${icon}`;
}

export function isValidIcon(icon: string): boolean {
  return COLLECTION_ICONS.includes(icon);
}

export function randomIcon(): string {
  return COLLECTION_ICONS[Math.floor(Math.random() * COLLECTION_ICONS.length)];
}
