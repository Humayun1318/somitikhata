import { z } from 'zod';

const bdPhoneRegex = /^01[3-9]\d{8}$/;
const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;

export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    phone: z
      .string()
      .min(1, t('validation.phoneRequired'))
      .regex(bdPhoneRegex, t('validation.phoneInvalid')),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(6, t('validation.passwordMin')),
  });
}

export function createRegisterSchema(t: (key: string) => string) {
  return z
    .object({
      fullName: z.string().min(1, t('validation.nameRequired')),
      phone: z
        .string()
        .min(1, t('validation.phoneRequired'))
        .regex(bdPhoneRegex, t('validation.phoneInvalid')),
      nidNumber: z
        .string()
        .min(1, t('validation.nidRequired'))
        .regex(nidRegex, t('validation.nidInvalid')),
      password: z
        .string()
        .min(1, t('validation.passwordRequired'))
        .min(6, t('validation.passwordMin')),
      confirmPassword: z.string().min(1, t('validation.passwordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsMatch'),
      path: ['confirmPassword'],
    });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;