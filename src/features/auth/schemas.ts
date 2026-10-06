import { z } from 'zod';

export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    identifier: z.string().min(1, t('validation.identifierRequired')),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(6, t('validation.passwordMin')),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

