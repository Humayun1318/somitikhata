'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createRegisterSchema, RegisterInput } from '@/lib/validations/zod/auth';


export function RegisterForm() {
  const t = useTranslations('Auth');
  const [serverError, setServerError] = useState<string | null>(null);

  const registerSchema = createRegisterSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      nidNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      // TODO: Replace with backend registration service call
      console.log('Register Payload:', data);
    } catch {
      setServerError(t('serverErrorRegister'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {serverError}
        </div>
      )}

      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t('fullName')}
        </label>
        <Input
          id="fullName"
          type="text"
          placeholder={t('fullNamePlaceholder')}
          error={!!errors.fullName}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t('phone')}
        </label>
        <Input
          id="phone"
          type="number"
          placeholder={t('phonePlaceholder')}
          error={!!errors.phone}
          {...register('phone')}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="nidNumber"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t('nidNumber')}
        </label>
        <Input
          id="nidNumber"
          type="text"
          placeholder={t('nidPlaceholder')}
          error={!!errors.nidNumber}
          {...register('nidNumber')}
        />
        {errors.nidNumber && (
          <p className="mt-1 text-xs text-red-600">
            {errors.nidNumber.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t('password')}
        </label>
        <Input
          id="password"
          type="password"
          placeholder={t('passwordPlaceholder')}
          error={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t('confirmPassword')}
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder={t('passwordPlaceholder')}
          error={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {isSubmitting ? t('submitting') : t('registerSubmit')}
      </Button>

      <p className="mt-4 text-center text-sm text-app-text-muted">
        {t('haveAccount')}{' '}
        <Link
          href="/login"
          className="font-semibold text-app-primary hover:underline"
        >
          {t('loginLink')}
        </Link>
      </p>
    </form>
  );
}