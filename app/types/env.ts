declare global {
  type D1Response = {
    success: boolean;
    error?: string;
    meta: any; // Meta is often highly dynamic in D1
  }
  type D1Result<T = unknown> = D1Response & {
    results: T[];
  }
  type D1Database = {
    prepare(query: string): { bind(...values: any[]): any };
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: any[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1Response>;
  }
}

export type Env = {
  abelma: D1Database;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_URL?: string;
}



