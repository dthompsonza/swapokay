import { Injectable, computed, signal } from '@angular/core';
import { base64ToCounts, clampCount, countsToBase64, encodeCollection } from './collection-codec';
import { isValidIcon, randomIcon } from './collection-icons';
import { StoredCollection } from './models';

const STORAGE_KEY = 'swapokay.collections.v1';

@Injectable({ providedIn: 'root' })
export class CollectionStore {
  private readonly all = signal<StoredCollection[]>(this.load());
  readonly collections = this.all.asReadonly();

  forKind(kind: string) {
    return computed(() => this.all().filter((c) => c.kind === kind));
  }

  get(kind: string, name: string): StoredCollection | undefined {
    return this.all().find((c) => c.kind === kind && c.name === name);
  }

  namesForKind(kind: string): string[] {
    return this.all().filter((c) => c.kind === kind).map((c) => c.name);
  }

  add(kind: string, name: string, itemCount: number, icon: string): void {
    const entry: StoredCollection = {
      kind,
      name: name.trim(),
      data: countsToBase64(new Array<number>(itemCount).fill(0)),
      icon,
      updated: new Date().toISOString(),
    };
    this.save([...this.all(), entry]);
  }

  setCount(kind: string, name: string, index: number, value: number): void {
    const current = this.get(kind, name);
    const counts = current && base64ToCounts(current.data);
    if (!current || !counts || index < 0 || index >= counts.length) return;
    counts[index] = clampCount(value);
    this.replace(current, { ...current, data: countsToBase64(counts), updated: new Date().toISOString() });
  }

  edit(kind: string, name: string, newName: string, icon: string): void {
    const current = this.get(kind, name);
    if (current) this.replace(current, { ...current, name: newName.trim(), icon, updated: new Date().toISOString() });
  }

  remove(kind: string, name: string): void {
    const current = this.get(kind, name);
    if (current) this.save(this.all().filter((c) => c !== current));
  }

  encoded(collection: StoredCollection): string {
    return encodeCollection(collection.kind, collection.name, base64ToCounts(collection.data) ?? [], collection.icon);
  }

  private replace(old: StoredCollection, next: StoredCollection): void {
    this.save(this.all().map((c) => (c === old ? next : c)));
  }

  private save(next: StoredCollection[]): void {
    this.all.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable or full; state stays in memory for this session.
    }
  }

  private load(): StoredCollection[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(parsed)) return [];
      const valid = parsed.filter(
        (c): c is StoredCollection =>
          !!c && typeof c.kind === 'string' && typeof c.name === 'string' && typeof c.data === 'string' && typeof c.updated === 'string',
      );
      let migrated = false;
      const result = valid.map((c) => {
        if (typeof c.icon === 'string' && isValidIcon(c.icon)) return c;
        migrated = true;
        return { ...c, icon: randomIcon() };
      });
      if (migrated) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        } catch {
          // Ignore; icons are reassigned next load.
        }
      }
      return result;
    } catch {
      return [];
    }
  }
}
