"use client";

import { useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, Info, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ListLoading } from "@/components/shared/list-states";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/features/auth/hooks/use-me";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { formatPaisa } from "@/lib/money";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useCreateOpening } from "../hooks/use-collection-mutations";
import { SegmentedControl } from "@/components/ui/segmented-control";

import {
  useCashAccounts,
  useHeadBalances,
  useMemberLookup,
  useTransactionTypes,
} from "../hooks/use-collection-queries";
import {
  OPENING_FIELDS,
  openingSchema,
  openingTargetOf,
  toOpeningPayload,
  type OpeningInput,
  type OpeningTarget,
} from "../schemas";
import { typeName } from "../transaction-effects";

import { FormAlert } from "@/components/shared/form-alert";
import { MemberPreview } from "./member-preview";
import { OpeningSummaryCard } from "./opening-summary-card";

const RULE_KEYS = ["once", "fix", "date"] as const;
const TARGETS: OpeningTarget[] = ["member", "account", "head"];

// Go-live balances carried over from the old books: the go-live check for
// everyone, the entry form (POST /transactions/opening) for the super admin.
// One tab per target: members, cash/bank accounts, ledger heads.
export function OpeningPage() {
  const t = useTranslations("OpeningForm");
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === "super_admin";
  const [target, setTarget] = useState<OpeningTarget>("member");
  const targetOptions = TARGETS.map((value) => ({ value, label: t(`tabs.${value}`) }));
  const changeTarget = (value: string) => setTarget(value as OpeningTarget);

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

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

      <OpeningSummaryCard />

      {isSuperAdmin && (
        <div className="space-y-3">
          <SegmentedControl aria-label={t("tabsLabel")} value={target} onChange={changeTarget} options={targetOptions} />
          <OpeningForm key={target} target={target} />
        </div>
      )}
    </div>
  );
}

type LastSaved = { transactionNo: string; amount: string };

// One form per tab (the parent remounts it on a tab change, so it starts fresh).
function OpeningForm({ target }: { target: OpeningTarget }) {
  const t = useTranslations("OpeningForm");
  const tForm = useTranslations("TransactionForm");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const catalog = useTransactionTypes();
  const accounts = useCashAccounts();
  const heads = useHeadBalances();
  const createOpening = useCreateOpening();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<LastSaved | null>(null);

  // Only this tab's opening types; a tab with one type (cash, head) picks it.
  const openingTypes = catalog.types.filter(
    (type) => type.typeGroup === "opening" && openingTargetOf(type) === target,
  );
  const targetOf = (code: string) => openingTargetOf(openingTypes.find((type) => type.code === code));
  const onlyType = openingTypes.length === 1 ? openingTypes[0] : undefined;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OpeningInput>({
    resolver: zodResolver(openingSchema(tForm, t, targetOf)),
    defaultValues: {
      typeCode: onlyType?.code ?? "",
      memberNo: "",
      cashAccountId: "",
      headId: "",
      amount: "",
      transactionDate: toDhakaDateString(),
      description: "",
    },
    mode: "onTouched",
  });

  const memberNoInput = useWatch({ control, name: "memberNo" });
  const isMemberType = target === "member";
  const lookupNo = useDebouncedValue(isMemberType ? memberNoInput.trim() : "");
  const lookup = useMemberLookup(lookupNo);
  const isLooking = !!lookupNo && (lookup.isPending || lookupNo !== memberNoInput.trim());
  const isNotFound = !isLooking && (lookup.error?.status === 404 || lookup.error?.status === 400);
  const isBusy = isSubmitting || createOpening.isPending;
  const accountList = accounts.data ?? [];
  const typeOptions = openingTypes.map((type) => ({ value: type.code, label: typeName(type, locale) }));
  const accountOptions = accountList.map((account) => ({ value: account._id, label: account.name }));
  // Only open heads that can carry an opening (asset, liability, fund), by kind
  const headKinds = onlyType?.headKinds ?? [];
  const headOptions = (heads.data ?? [])
    .filter((head) => head.status === "active" && headKinds.includes(head.kind))
    .map((head) => ({ value: head._id, label: head.nameBn, group: t(`headKinds.${head.kind}`) }));
  const isCatalogLoading = catalog.isPending;

  const save = async (values: OpeningInput) => {
    setFormError(null);
    try {
      const created = await createOpening.mutateAsync(toOpeningPayload(values, targetOf(values.typeCode)));
      toast.success(t("success", { transactionNo: created.transactionNo }));
      setLastSaved({ transactionNo: created.transactionNo, amount: formatPaisa(created.amount, locale) });
      // Keep the type and date for the next entry of the same batch.
      reset({ ...values, memberNo: "", cashAccountId: "", headId: "", amount: "", description: "" });
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

  if (isCatalogLoading) return <ListLoading rows={3} />;

  return (
    <section className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-6">
      <h2 className="text-base font-semibold text-app-text">{t(`formTitles.${target}`)}</h2>
      <p className="mt-0.5 text-sm text-app-text-muted">{t(`formHints.${target}`)}</p>

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
          {!onlyType && (
            <FormField id="opening-typeCode" label={t("type")} error={errors.typeCode?.message}>
              <Controller
                control={control}
                name="typeCode"
                render={({ field }) => (
                  <SelectMenu
                    id="opening-typeCode"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={typeOptions}
                    placeholder={t("typePlaceholder")}
                    disabled={isBusy}
                    error={!!errors.typeCode}
                    aria-describedby={errors.typeCode ? "opening-typeCode-error" : undefined}
                  />
              )}
            />
          </FormField>
          )}

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

          {target === "head" && (
            <FormField id="opening-headId" label={t("head")} error={errors.headId?.message}>
              <Controller
                control={control}
                name="headId"
                render={({ field }) => (
                  <SelectMenu
                    id="opening-headId"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={headOptions}
                    placeholder={heads.isPending ? t("headsLoading") : t("headPlaceholder")}
                    disabled={isBusy}
                    error={!!errors.headId}
                    aria-describedby={errors.headId ? "opening-headId-error" : undefined}
                  />
                )}
              />
              {heads.data && headOptions.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-700">{t("noHeads")}</p>
              )}
            </FormField>
          )}

          {target === "account" && (
            <FormField id="opening-cashAccountId" label={t("account")} error={errors.cashAccountId?.message}>
              <Controller
                control={control}
                name="cashAccountId"
                render={({ field }) => (
                  <SelectMenu
                    id="opening-cashAccountId"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={accountOptions}
                    placeholder={t("accountPlaceholder")}
                    disabled={isBusy}
                    error={!!errors.cashAccountId}
                    aria-describedby={errors.cashAccountId ? "opening-cashAccountId-error" : undefined}
                  />
                )}
              />
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
