import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CollectibleKind, KindSummary } from './models';

@Injectable({ providedIn: 'root' })
export class KindService {
  private readonly http = inject(HttpClient);
  private kinds?: Promise<KindSummary[]>;
  private readonly kindCache = new Map<string, Promise<CollectibleKind>>();

  getKinds(): Promise<KindSummary[]> {
    this.kinds ??= this.evictOnFailure(firstValueFrom(this.http.get<KindSummary[]>('data/kinds.json')), () => (this.kinds = undefined));
    return this.kinds;
  }

  getKind(code: string): Promise<CollectibleKind> {
    let kind = this.kindCache.get(code);
    if (!kind) {
      kind = this.evictOnFailure(
        this.getKinds().then((kinds) => {
          const summary = kinds.find((k) => k.code === code);
          if (!summary) throw new Error(`Unknown collectible kind "${code}".`);
          return firstValueFrom(this.http.get<CollectibleKind>(`data/${summary.file}`));
        }),
        () => this.kindCache.delete(code),
      );
      this.kindCache.set(code, kind);
    }
    return kind;
  }

  private evictOnFailure<T>(promise: Promise<T>, evict: () => void): Promise<T> {
    promise.catch(evict);
    return promise;
  }
}
