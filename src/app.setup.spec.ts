import { describe, expect, it } from 'vitest';
import { assertSafeJwtSecret } from './app.setup.js';

describe('assertSafeJwtSecret', () => {
  it('no valida el secreto fuera de producción', () => {
    expect(() => assertSafeJwtSecret('change-me', 'development')).not.toThrow();
    expect(() => assertSafeJwtSecret(undefined, 'test')).not.toThrow();
  });

  it('rechaza en producción un secreto ausente, de ejemplo o demasiado corto', () => {
    expect(() => assertSafeJwtSecret(undefined, 'production')).toThrow(/JWT_SECRET/);
    expect(() => assertSafeJwtSecret('change-me', 'production')).toThrow(/JWT_SECRET/);
    expect(() => assertSafeJwtSecret('corto', 'production')).toThrow(/JWT_SECRET/);
  });

  it('acepta en producción un secreto de al menos 32 caracteres', () => {
    expect(() => assertSafeJwtSecret('x'.repeat(32), 'production')).not.toThrow();
  });
});
