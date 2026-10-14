/**
 * Client Supabase Moderne & Typé (PostgREST Zero-Dependency)
 * Compatible Next.js 16 (Server Components, Server Actions & Route Handlers)
 * Projet Ref : ucgslhophamzwqbkkayu
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ucgslhophamzwqbkkayu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZ3NsaG9waGFtendxYmtrYXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MTQ1MDksImV4cCI6MjEwNzI5MDUwOX0.FLAGfbDzyMnIbOESR3O0E6CJip9AfvGBNswq0d11OkM';

interface QueryOptions {
  select?: string;
  order?: string;
  limit?: number;
  eq?: Record<string, any>;
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
   * Sélectionner des enregistrements
   */
  async select(columns: string = '*', options: QueryOptions = {}) {
    const params = new URLSearchParams();
    params.set('select', columns);

    if (options.limit) params.set('limit', String(options.limit));
    if (options.order) params.set('order', options.order);
    if (options.eq) {
      for (const [key, value] of Object.entries(options.eq)) {
        params.set(key, `eq.${value}`);
      }
    }

    const endpoint = `${this.url}/rest/v1/${this.table}?${params.toString()}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase SELECT error (${this.table}): ${err}`);
    }

    return await res.json();
  }

  /**
   * Insérer un ou plusieurs enregistrements
   */
  async insert(data: Record<string, any> | Record<string, any>[]) {
    const endpoint = `${this.url}/rest/v1/${this.table}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase INSERT error (${this.table}): ${err}`);
    }

    return await res.json();
  }

  /**
   * Mettre à jour des enregistrements filtrés par champ
   */
  async update(filters: Record<string, any>, data: Record<string, any>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      params.set(key, `eq.${value}`);
    }

    const endpoint = `${this.url}/rest/v1/${this.table}?${params.toString()}`;
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase UPDATE error (${this.table}): ${err}`);
    }

    return await res.json();
  }

  /**
   * Supprimer des enregistrements filtrés
   */
  async delete(filters: Record<string, any>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      params.set(key, `eq.${value}`);
    }

    const endpoint = `${this.url}/rest/v1/${this.table}?${params.toString()}`;
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase DELETE error (${this.table}): ${err}`);
    }

    return await res.json();
  }

  /**
   * Upsert (Insertion ou mise à jour sur conflit de clé unique)
   */
  async upsert(data: Record<string, any> | Record<string, any>[], onConflict: string = 'id') {
    const params = new URLSearchParams();
    params.set('on_conflict', onConflict);

    const endpoint = `${this.url}/rest/v1/${this.table}?${params.toString()}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders({
        'Prefer': 'resolution=merge-duplicates,return=representation',
      }),
      body: JSON.stringify(data),
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
