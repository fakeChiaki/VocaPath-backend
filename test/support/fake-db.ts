import type { DrizzleDb } from '../../src/database/database.types.js';

/**
 * Doble de la base de datos para pruebas unitarias. Cada consulta encadenada
 * (select().from().where()...) que se espera con `await` consume el siguiente
 * resultado de la cola, y `calls` registra la cadena de métodos usada.
 */
export function fakeDb(...results: unknown[]) {
  const queue = [...results];
  const calls: string[][] = [];
  let chain: string[] = [];

  const db: unknown = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (value: unknown) => void, reject: (reason: unknown) => void) => {
            calls.push(chain);
            chain = [];
            const next = queue.length > 0 ? queue.shift() : [];
            if (next instanceof Error) reject(next);
            else resolve(next);
          };
        }
        if (prop === 'transaction') return async (callback: (tx: unknown) => unknown) => callback(db);
        return (..._args: unknown[]) => {
          chain.push(String(prop));
          return db;
        };
      },
    },
  );

  return { db: db as DrizzleDb, calls, pending: () => queue.length };
}
