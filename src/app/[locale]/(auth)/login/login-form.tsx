'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type LoginFormProps = {
  locale: string;
};

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
      });

      if (!response.ok) {
        throw new Error('login_failed');
      }

      router.replace(`/${locale}/member/dashboard`);
      router.refresh();
    } catch {
      setErrorMessage(t('loginFailed'));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="identity" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
          {t('identityLabel')}
        </label>
        <input
          id="identity"
          name="identity"
          value={identity}
          onChange={(event) => setIdentity(event.target.value)}
          placeholder={t('identityPlaceholder')}
          autoComplete="username"
          required
          className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
          {t('passwordLabel')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('passwordPlaceholder')}
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="remember" />
          {t('rememberMe')}
        </label>
        <button type="button" className="font-medium text-[var(--color-primary)]">
          {t('forgotPassword')}
        </button>
      </div>
      {errorMessage ? (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 w-full rounded-xl bg-[var(--color-primary)] font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)]"
      >
        {isSubmitting ? t('loggingIn') : t('login')}
      </button>
    </form>
  );
}
