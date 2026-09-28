"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLoginSchema, type LoginInput } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/hooks/use-login";
import { ApiError } from "@/lib/api-errors";

export function LoginForm() {
  const t = useTranslations("Auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const loginMutation = useLogin();
  const loginSchema = createLoginSchema(t);

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
      // right dashboard/profile route itself — nothing else to do here.
      await loginMutation.mutateAsync(data);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : t("serverErrorLogin"),
      );
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
          htmlFor="identifier"
          className="mb-1.5 block text-sm font-medium text-app-text"
        >
          {t("identifier")}
        </label>
        <Input
          id="identifier"
          type="text"
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
        <Input
          id="password"
          type="password"
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
