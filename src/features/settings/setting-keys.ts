import type { SettingFormat, SettingKey } from "./types";

type SettingDefinition = {
  key: SettingKey;
  format: SettingFormat;
  /** Fund percents may be 0; the two limits must be at least 1 (backend rule). */
  min?: number;
  /** Shown but not editable here (see `readOnlyReason` in the messages). */
  readOnly?: boolean;
};

type SettingGroup = { id: "limits" | "yearEnd" | "funds" | "books"; settings: SettingDefinition[] };

// The settings screen, grouped the way the samiti thinks about them. The same
// ranges as validateValueForKey in the backend setting.service.ts.
export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: "limits",
    settings: [
      { key: "withdrawal_limit_percent", format: "percent", min: 1 },
      { key: "loan_limit_percent", format: "percent", min: 1 },
    ],
  },
  {
    id: "yearEnd",
    settings: [
      { key: "service_charge_amount", format: "money" },
      { key: "profit_cap_threshold", format: "money" },
      { key: "profit_cap_amount", format: "money" },
      { key: "profit_max_amount", format: "money" },
    ],
  },
  {
    id: "funds",
    settings: [
      { key: "reserve_fund_percent", format: "percent", min: 0 },
      { key: "coop_dev_fund_percent", format: "percent", min: 0 },
      { key: "welfare_fund_percent", format: "percent", min: 0 },
    ],
  },
  {
    id: "books",
    settings: [
      // The backend still uses a fixed July start for transaction numbers, so
      // changing this value would have no effect yet.
      { key: "fiscal_year_start_month", format: "month", readOnly: true },
      { key: "backdate_lock_until", format: "date" },
    ],
  },
];

export const SETTING_DEFINITIONS = SETTING_GROUPS.flatMap((group) => group.settings);
