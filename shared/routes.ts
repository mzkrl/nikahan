import { z } from 'zod';
import { insertGuestSchema, guests } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  guests: {
    list: {
      method: 'GET' as const,
      path: '/api/guests',
      responses: {
        200: z.array(z.custom<typeof guests.$inferSelect>()),
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/guests/slug/:slug',
      responses: {
        200: z.custom<typeof guests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/guests/:id',
      input: z.object({
        attendanceStatus: z.enum(['pending', 'present', 'absent']).optional(),
        wishes: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof guests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  admin: {
    login: {
      method: 'POST' as const,
      path: '/api/admin/login',
      input: z.object({ password: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          total: z.number(),
          present: z.number(),
          absent: z.number(),
          pending: z.number(),
          guests: z.array(z.custom<typeof guests.$inferSelect>()),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
