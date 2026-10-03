// Shapes from the backend setting module. Every value is stored as a string:
// percents as "95", money as whole PAISA ("192800"), the lock as an ISO date.

export type SettingKey =
  | "withdrawal_limit_percent"
  | "loan_limit_percent"
  | "service_charge_amount"
  | "profit_cap_threshold"
  | "profit_cap_amount"
  | "profit_max_amount"
  | "reserve_fund_percent"
  | "coop_dev_fund_percent"
  | "welfare_fund_percent"
  | "fiscal_year_start_month"
  | "backdate_lock_until";

// GET /settings and GET /settings/:key
export type SettingSummary = {
  key: SettingKey;
  value: string | null; // null = never configured
  effectiveFrom: string | null;
  changedAt: string | null;
  /** A next version already saved for a later date. */
  upcoming: { value: string; effectiveFrom: string } | null;
};

// PATCH /settings/:key (super admin). effectiveFrom: YYYY-MM-DD.
export type UpdateSettingPayload = { value: string; effectiveFrom: string };

/** How a key's value is read, typed and shown. */
export type SettingFormat = "percent" | "money" | "month" | "date";
