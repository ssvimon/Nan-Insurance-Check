declare module "cloudflare:workers" {
  // Minimal stub so Next.js/Vercel typecheck can succeed without Cloudflare runtime.
  export const env: {
    DB?: D1Database;
    [key: string]: unknown;
  };
}

interface D1Database {
  prepare(query: string): unknown;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: unknown[]): Promise<T[]>;
  exec(query: string): Promise<unknown>;
}
