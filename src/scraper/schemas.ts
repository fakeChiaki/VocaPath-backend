import { z } from 'zod';

export const httpUrl = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'Solo se aceptan URLs http o https');
