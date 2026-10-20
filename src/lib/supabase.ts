/**
 * Client Supabase Moderne & Typé (PostgREST Zero-Dependency)
 * Compatible Next.js 16 (Server Components, Server Actions & Route Handlers)
 * Projet Ref : ucgslhophamzwqbkkayu
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ucgslhophamzwqbkkayu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZ3NsaG9waGFtendxYmtrYXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MTQ1MDksImV4cCI6MjEwNzI5MDUwOX0.FLAGfbDzyMnIbOESR3O0E6CJip9AfvGBNswq0d11OkM';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DEFAULT_WORKSPACE_UUID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
export const DEFAULT_OWNER_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export const KNOWN_UUID_MAP: Record<string, string> = {
  'ws_nutristore': DEFAULT_WORKSPACE_UUID,
  'user_mohamed': DEFAULT_OWNER_UUID,
  'ws_1792499208803_hvs5': 'f8c0d4b2-3e5f-4a6b-9c7d-0e1f2a3b4c5d',
  'user_1792499208798_9wn0': 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c',
};

export function resolveWorkspaceUuid(id?: string): string {
  if (!id) return DEFAULT_WORKSPACE_UUID;
  if (UUID_REGEX.test(id)) return id;
  if (KNOWN_UUID_MAP[id]) return KNOWN_UUID_MAP[id];
  return DEFAULT_WORKSPACE_UUID;
}

export function resolveUserUuid(id?: string): string {
  if (!id) return DEFAULT_OWNER_UUID;
  if (UUID_REGEX.test(id)) return id;
  if (KNOWN_UUID_MAP[id]) return KNOWN_UUID_MAP[id];
  return DEFAULT_OWNER_UUID;
}

export function sanitizeColumnValue(column: string, value: any): any {
  if (typeof value !== 'string') return value;
  if (UUID_REGEX.test(value)) return value;
  if (column === 'workspace_id' || column === 'workspaceId') {
    return resolveWorkspaceUuid(value);
  }
  if (column === 'owner_id' || column === 'user_id' || column === 'userId') {
    return resolveUserUuid(value);
  }
  if (column === 'id' && (value === 'ws_nutristore' || value.startsWith('ws_'))) {
    return resolveWorkspaceUuid(value);
  }
  if (column === 'id' && (value === 'user_mohamed' || value.startsWith('user_'))) {
    return resolveUserUuid(value);
  }
  return value;
}

interface QueryOptions {
  select?: string;
  order?: string;
  limit?: number;
  eq?: Record<string, any>;
}

const globalForSupabase = globalThis as unknown as {
  __markmosaiq_supabaseOnline?: boolean;
  __markmosaiq_lastFailure?: number;
};

if (globalForSupabase.__markmosaiq_supabaseOnline === undefined) {
  globalForSupabase.__markmosaiq_supabaseOnline = true;
  globalForSupabase.__markmosaiq_lastFailure = 0;
}

const CIRCUIT_BREAKER_COOLDOWN_MS = 300_000; // 5 minutes bypass on failure to keep dev & browsing blazing fast
const SUPABASE_TIMEOUT_MS = 800; // 800ms strict timeout

function shouldSkipSupabase(): boolean {
  if (process.env.SUPABASE_DISABLED === 'true') return true;
  if (!globalForSupabase.__markmosaiq_supabaseOnline) {
    if (Date.now() - (globalForSupabase.__markmosaiq_lastFailure || 0) < CIRCUIT_BREAKER_COOLDOWN_MS) {
      return true; // Fast bypass directly to fallback (0ms latency)
    }
    // Allow single probe request after cooldown
    globalForSupabase.__markmosaiq_supabaseOnline = true;
  }
  return false;
}

function markSupabaseFailure(err: any, table: string) {
  globalForSupabase.__markmosaiq_supabaseOnline = false;
  globalForSupabase.__markmosaiq_lastFailure = Date.now();
  console.warn(`[Supabase Circuit-Breaker Triggered on ${table} - Bypassing for 5m]:`, err?.message || err);
}

class SupabaseSelectQuery implements PromiseLike<any> {
  private table: string;
  private url: string;
  private key: string;
  private params: URLSearchParams;
  private isSingleMode: boolean = false;

  constructor(table: string, url: string, key: string, columns: string = '*', options: QueryOptions = {}) {
    this.table = table;
    this.url = url;
    this.key = key;
    this.params = new URLSearchParams();
    this.params.set('select', columns);

    if (options.limit) this.params.set('limit', String(options.limit));
    if (options.order) this.params.set('order', options.order);
    if (options.eq) {
      for (const [key, value] of Object.entries(options.eq)) {
        const cleanVal = sanitizeColumnValue(key, value);
        this.params.set(key, `eq.${cleanVal}`);
      }
    }
  }

  eq(column: string, value: any): this {
    const cleanVal = sanitizeColumnValue(column, value);
    this.params.set(column, `eq.${cleanVal}`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    const dir = options?.ascending === false ? 'desc' : 'asc';
    this.params.set('order', `${column}.${dir}`);
    return this;
  }

  limit(count: number): this {
    this.params.set('limit', String(count));
    return this;
  }

  single(): this {
    this.isSingleMode = true;
    this.params.set('limit', '1');
    return this;
  }

  maybeSingle(): this {
    this.isSingleMode = true;
    this.params.set('limit', '1');
    return this;
  }

  private async execute(): Promise<any> {
    if (shouldSkipSupabase()) {
      if (this.isSingleMode) return { data: null, error: null };
      const fallbackArr: any = [];
      fallbackArr.data = null;
      fallbackArr.error = null;
      return fallbackArr;
    }

    try {
      const endpoint = `${this.url}/rest/v1/${this.table}?${this.params.toString()}`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
      });

      if (!res.ok) {
        const err = await res.text();
        markSupabaseFailure(err, this.table);
        if (this.isSingleMode) {
          return { data: null, error: new Error(err) };
        }
        const fallbackArr: any = [];
        fallbackArr.data = null;
        fallbackArr.error = new Error(err);
        return fallbackArr;
      }

      globalForSupabase.__markmosaiq_supabaseOnline = true;
      const json = await res.json();
      if (this.isSingleMode) {
        const singleItem = Array.isArray(json) && json.length > 0 ? json[0] : null;
        return { data: singleItem, error: null };
      }

      if (Array.isArray(json)) {
        (json as any).data = json;
        (json as any).error = null;
      }
      return json;
    } catch (err: any) {
      markSupabaseFailure(err, this.table);
      if (this.isSingleMode) {
        return { data: null, error: err };
      }
      const fallbackArr: any = [];
      fallbackArr.data = null;
      fallbackArr.error = err;
      return fallbackArr;
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class SupabaseMutationQuery implements PromiseLike<any> {
  private table: string;
  private url: string;
  private key: string;
  private method: string;
  private data: Record<string, any> | Record<string, any>[];
  private params: URLSearchParams;

  constructor(
    table: string,
    url: string,
    key: string,
    method: 'PATCH' | 'POST' | 'DELETE',
    data: Record<string, any> | Record<string, any>[] = {},
    initialFilters: Record<string, any> = {}
  ) {
    this.table = table;
    this.url = url;
    this.key = key;
    this.method = method;
    this.data = data;
    this.params = new URLSearchParams();

    for (const [k, v] of Object.entries(initialFilters || {})) {
      this.params.set(k, `eq.${sanitizeColumnValue(k, v)}`);
    }
  }

  eq(column: string, value: any): this {
    this.params.set(column, `eq.${sanitizeColumnValue(column, value)}`);
    return this;
  }

  private async execute(): Promise<any> {
    if (shouldSkipSupabase()) {
      return { data: null, error: null };
    }

    try {
      let cleanData: any = undefined;
      if (this.method !== 'GET' && this.method !== 'DELETE') {
        if (Array.isArray(this.data)) {
          cleanData = this.data.map((item) =>
            Object.fromEntries(
              Object.entries(item || {}).map(([k, v]) => [k, sanitizeColumnValue(k, v)])
            )
          );
        } else if (this.data && typeof this.data === 'object') {
          cleanData = Object.fromEntries(
            Object.entries(this.data).map(([k, v]) => [k, sanitizeColumnValue(k, v)])
          );
        }
      }

      const endpoint = `${this.url}/rest/v1/${this.table}?${this.params.toString()}`;
      const res = await fetch(endpoint, {
        method: this.method,
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: cleanData !== undefined ? JSON.stringify(cleanData) : undefined,
        signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
      });

      if (!res.ok) {
        const err = await res.text();
        markSupabaseFailure(err, this.table);
        return { data: null, error: new Error(err) };
      }

      globalForSupabase.__markmosaiq_supabaseOnline = true;
      return await res.json();
    } catch (err: any) {
      markSupabaseFailure(err, this.table);
      return { data: null, error: err };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class SupabaseTableQuery {
  private table: string;
  private url: string;
  private key: string;

  constructor(table: string, url: string, key: string) {
    this.table = table;
    this.url = url;
    this.key = key;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}) {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...extraHeaders,
    };
  }

  /**
   * Sélectionner des enregistrements (retourne un query chainable et awaitable)
   */
  select(columns: string = '*', options: QueryOptions = {}): SupabaseSelectQuery {
    return new SupabaseSelectQuery(this.table, this.url, this.key, columns, options);
  }

  /**
   * Insérer un ou plusieurs enregistrements
   */
  async insert(data: Record<string, any> | Record<string, any>[]) {
    const cleanData = Array.isArray(data)
      ? data.map((item) => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, sanitizeColumnValue(k, v)])))
      : Object.fromEntries(Object.entries(data).map(([k, v]) => [k, sanitizeColumnValue(k, v)]));

    const endpoint = `${this.url}/rest/v1/${this.table}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(cleanData),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`[Supabase INSERT fallback (${this.table})]:`, err);
      return { data: null, error: new Error(err) };
    }

    return await res.json();
  }

  /**
   * Mettre à jour des enregistrements (supporte update(filters, data) et update(data).eq(...))
   */
  update(arg1: Record<string, any>, arg2?: Record<string, any>): SupabaseMutationQuery {
    if (arg2 !== undefined) {
      return new SupabaseMutationQuery(this.table, this.url, this.key, 'PATCH', arg2, arg1);
    }
    return new SupabaseMutationQuery(this.table, this.url, this.key, 'PATCH', arg1);
  }

  /**
   * Supprimer des enregistrements filtrés
   */
  delete(filters: Record<string, any> = {}): SupabaseMutationQuery {
    return new SupabaseMutationQuery(this.table, this.url, this.key, 'DELETE', {}, filters);
  }

  /**
   * Upsert (Insertion ou mise à jour sur conflit de clé unique)
   */
  async upsert(data: Record<string, any> | Record<string, any>[], onConflict: string = 'id') {
    const params = new URLSearchParams();
    params.set('on_conflict', onConflict);

    const cleanData = Array.isArray(data)
      ? data.map((item) => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, sanitizeColumnValue(k, v)])))
      : Object.fromEntries(Object.entries(data).map(([k, v]) => [k, sanitizeColumnValue(k, v)]));

    const endpoint = `${this.url}/rest/v1/${this.table}?${params.toString()}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders({
        'Prefer': 'resolution=merge-duplicates,return=representation',
      }),
      body: JSON.stringify(cleanData),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase UPSERT error (${this.table}): ${err}`);
    }

    return await res.json();
  }
}

export const supabase = {
  from(table: string) {
    return new SupabaseTableQuery(table, SUPABASE_URL, SUPABASE_KEY);
  },
};
