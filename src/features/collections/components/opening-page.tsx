"use client";

import { useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, Info, ShieldAlert } from "lucide-react";

import { ListLoading } from "@/components/shared/list-states";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/features/auth/hooks/use-me";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { formatPaisa } from "@/lib/money";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useCreateOpening } from "../hooks/use-collection-mutations";
import { useCashAccounts, useMemberLookup, useTransactionTypes } from "../hooks/use-collection-queries";
import { OPENING_FIELDS, openingSchema, toOpeningPayload, type OpeningInput } from "../schemas";
import { typeName } from "../transaction-effects";

import { CollectionsHeader } from "./collections-header";
import { FormAlert } from "@/components/shared/form-alert";
import { MemberPreview } from "./member-preview";

const RULE_KEYS = ["once", "fix", "date"] as const;

// POST /transactions/opening (super admin only): balances carried over from the old books.
export function OpeningPage() {
  const t = useTranslations("OpeningForm");
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <div className="space-y-5">
      <CollectionsHeader title={t("title")} subtitle={t("subtitle")} />

      {!isSuperAdmin && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {t("superAdminOnly")}
        </p>
      )}

      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <h2 className="flex items-center gap-2 font-semibold">
          <Info aria-hidden="true" className="h-4 w-4" />
          {t("rules.title")}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          {RULE_KEYS.map((key) => (
            <li key={key}>{t(`rules.${key}`)}</li>
          ))}
        </ul>
      </section>

      {isSuperAdmin && <OpeningForm />}
    </div>
  );
}

type LastSaved = { transactionNo: string; amount: string };

function OpeningForm() {
  const t = useTranslations("OpeningForm");
  const tForm = useTranslations("TransactionForm");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const catalog = useTransactionTypes();
  const accounts = useCashAccounts();
  const createOpening = useCreateOpening();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<LastSaved | null>(null);

  const openingTypes = catalog.types.filter((type) => type.typeGroup === "opening");
  const needsMember = (code: string) => openingTypes.find((type) => type.code === code)?.memberRule === "required";

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OpeningInput>({
    resolver: zodResolver(openingSchema(tForm, t, needsMember)),
    defaultValues: {
      typeCode: "",
      memberNo: "",
      cashAccountId: "",
      amount: "",
      transactionDate: toDhakaDateString(),
      description: "",
    },
    mode: "onTouched",
  });

  const [typeCode, memberNoInput] = useWatch({ control, name: ["typeCode", "memberNo"] });
  const isMemberType = needsMember(typeCode);
  const showAccount = !!typeCode && !isMemberType;
  const lookupNo = useDebouncedValue(isMemberType ? memberNoInput.trim() : "");
  const lookup = useMemberLookup(lookupNo);
  const isLooking = !!lookupNo && (lookup.isPending || lookupNo !== memberNoInput.trim());
  const isNotFound = !isLooking && (lookup.error?.status === 404 || lookup.error?.status === 400);
  const isBusy = isSubmitting || createOpening.isPending;
  const accountList = accounts.data ?? [];

  const save = async (values: OpeningInput) => {
    setFormError(null);
    try {
      const created = await createOpening.mutateAsync(toOpeningPayload(values, needsMember(values.typeCode)));
      toast.success(t("success", { transactionNo: created.transactionNo }));
      setLastSaved({ transactionNo: created.transactionNo, amount: formatPaisa(created.amount, locale) });
      // Keep the type and date for the next entry of the same batch.
      reset({ ...values, memberNo: "", amount: "", description: "" });
    } catch (error) {
      const result = getCollectionError(error, tErrors, locale, OPENING_FIELDS);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field as keyof OpeningInput, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: OpeningInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const fieldProps = (name: keyof OpeningInput) => ({
    id: `opening-${name}`,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `opening-${name}-error` : undefined,
  });

  if (catalog.isPending) return <ListLoading rows={3} />;

  return (
    <section className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-6">
      <h2 className="text-base font-semibold text-app-text">{t("formTitle")}</h2>

      {lastSaved && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
          {t("lastSaved", lastSaved)}
        </p>
      )}

      <form onSubmit={submitForm} noValidate aria-busy={isBusy} className="mt-4 space-y-4">
        {formError && <FormAlert message={formError} />}
        {openingTypes.length === 0 && <FormAlert message={t("noTypes")} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="opening-typeCode" label={t("type")} error={errors.typeCode?.message}>
            <Select {...fieldProps("typeCode")} {...register("typeCode")} disabled={isBusy} className="min-h-11">
              <option value="">{t("typePlaceholder")}</option>
              {openingTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {typeName(type, locale)}
                </option>
              ))}
            </Select>
          </FormField>

          {isMemberType && (
            <FormField id="opening-memberNo" label={t("memberNo")} error={errors.memberNo?.message}>
              <Input
                {...fieldProps("memberNo")}
                {...register("memberNo")}
                autoComplete="off"
                autoCapitalize="characters"
                readOnly={isBusy}
                placeholder={t("memberNoPlaceholder")}
                className="min-h-11 font-mono"
              />
              <MemberPreview isLooking={isLooking} isNotFound={isNotFound} member={lookup.data} requireActive={false} />
            </FormField>
          )}

          {showAccount && (
            <FormField id="opening-cashAccountId" label={t("account")} error={errors.cashAccountId?.message}>
              <Select {...fieldProps("cashAccountId")} {...register("cashAccountId")} disabled={isBusy} className="min-h-11">
                <option value="">{t("accountPlaceholder")}</option>
                {accountList.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField id="opening-amount" label={t("amount")} error={errors.amount?.message}>
            <Input
              {...fieldProps("amount")}
              {...register("amount")}
              inputMode="decimal"
              autoComplete="off"
              readOnly={isBusy}
              placeholder="0.00"
              className="min-h-11 text-right text-base font-semibold tabular-nums"
            />
          </FormField>

          <FormField id="opening-transactionDate" label={t("date")} error={errors.transactionDate?.message}>
            <Input
              {...fieldProps("transactionDate")}
              {...register("transactionDate")}
              type="date"
              max={toDhakaDateString()}
              readOnly={isBusy}
              className="min-h-11"
            />
          </FormField>
        </div>

        <FormField id="opening-description" label={t("description")} labelHint={t("optional")} error={errors.description?.message}>
          <Textarea {...fieldProps("description")} {...register("description")} rows={2} maxLength={200} readOnly={isBusy} />
        </FormField>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isBusy} disabled={isNotFound} className="w-full sm:w-auto">
            {isBusy ? t("submitting") : t("submit")}
          </Button>
        </div>
      </form>
    </section>
  );
}
