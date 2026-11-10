const base = process.env.TEST_DATABASE_URL ?? 'postgresql://vocapath:vocapath@localhost:5432/vocapath_test';

export const TEST_DATABASE_URL = base;
export const ADMIN_DATABASE_URL = base.replace(/\/[^/]+$/, '/postgres');
export const TEST_DATABASE_NAME = base.split('/').pop()!;
