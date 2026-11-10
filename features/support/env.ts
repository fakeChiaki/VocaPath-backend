import { TEST_DATABASE_URL } from '../../test/support/env.js';

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS = '7';
process.env.FRONTEND_URL = 'http://localhost:5173';
