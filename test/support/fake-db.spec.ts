import { describe, expect, it } from 'vitest';
import { fakeDb } from './fake-db.js';

describe('fakeDb', () => {
  it('entrega los resultados en el orden de las consultas y registra las cadenas', async () => {
    const { db, calls } = fakeDb([{ id: 1 }], [{ id: 2 }]);

    const [first] = await db.select().from({} as never).where({} as never).limit(1);
    const second = await db.insert({} as never).values({} as never).returning();

    expect(first).toEqual({ id: 1 });
    expect(second).toEqual([{ id: 2 }]);
    expect(calls).toEqual([['select', 'from', 'where', 'limit'], ['insert', 'values', 'returning']]);
  });

  it('devuelve una lista vacía cuando la cola se agota y propaga los errores', async () => {
    const { db } = fakeDb(new Error('boom'));

    await expect(db.select().from({} as never)).rejects.toThrow('boom');
    expect(await db.select().from({} as never)).toEqual([]);
  });

  it('ejecuta las transacciones con el mismo doble', async () => {
    const { db } = fakeDb([{ ok: true }]);

    const result = await db.transaction(async (tx) => tx.select().from({} as never));

    expect(result).toEqual([{ ok: true }]);
  });
});
