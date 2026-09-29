"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CircleAlert, LockKeyhole } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { createLoginSchema, type LoginInput } from "@/features/auth/schemas";
import { useToast } from "@/components/shared/toast/toast-provider";
import { useLogin } from "@/features/auth/hooks/use-login";
import { getLoginError, type LoginError } from "@/features/auth/login-errors";

export function LoginForm() {
  const t = useTranslations("Auth");
  const toast = useToast();
  const loginMutation = useLogin();
  const loginSchema = createLoginSchema(t);
  // Inline copy of the API error. Stays until the next submit.
  const [serverError, setServerError] = useState<LoginError | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      // useLogin() calls /auth/login, then /user/me, then redirects to the
      // right dashboard/profile route itself. The toast lives in the root
      // layout, so it survives that redirect.
      await loginMutation.mutateAsync(data);
      toast.success(t("loginSuccess"));
    } catch (err) {
      // Same message in the toast and inside the form.
      const loginError = getLoginError(err, t);
      setServerError(loginError);
      toast.error(loginError.message);
    }
  };

  const ServerErrorIcon = serverError?.kind === "locked" ? LockKeyhole : CircleAlert;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          <ServerErrorIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{serverError.message}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="identifier"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t("identifier")}
        </label>
        <Input
          id="identifier"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          placeholder={t("identifierPlaceholder")}
          error={!!errors.identifier}
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="mt-1 text-xs text-red-600">
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t("password")}
        </label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          error={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {isSubmitting ? t("submitting") : t("loginSubmit")}
      </Button>

      <p className="mt-4 text-center text-sm text-app-text-muted">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-app-primary hover:underline"
        >
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
