export type GoldIncreaseByType = 'FLAT' | 'PERCENTAGE';

export type GoldCarat = '22Kt' | '20Kt' | '18Kt' | '14Kt' | '9Kt';

export interface GoldRate {
  id?: string;
  carat: GoldCarat | string;
  purity: number;
  finalRate: number;
  increaseByAmount?: number;
  increaseByType?: GoldIncreaseByType;
  baseRate?: number;
  mcxRate?: number;
  cashRate?: number;
  rtgsRate?: number;
}

export interface TaxSettings {
  rtgsChangeBy: number;
  cashChangeBy: number;
  scannerCalculationUse: 'rtgs' | 'cash' | 'mcx';
}

export interface GoldRatesResponse {
  mcxLiveRate: number;
  rates: GoldRate[];
  taxSettings?: TaxSettings;
}

export interface UpdateGoldRatePayload {
  carat: string;
  purity: number;
  increaseByAmount: number;
  increaseByType: GoldIncreaseByType;
}

export interface UpdateGoldTaxSettingsPayload {
  rtgsChangeBy?: number;
  cashChangeBy?: number;
  scannerCalculationUse?: 'rtgs' | 'cash' | 'mcx';
}

export interface StoneRate {
  id: string;
  color: string;
  clarity: string;
  rate: number;
  updatedAt?: string;
}

export interface UpsertStoneRatePayload {
  color: string;
  clarity: string;
  rate: number;
}

export type StoneLookupType = 'diamond' | 'colorstone';

export interface StoneRateLookupPayload {
  type: StoneLookupType;
  color: string;
  clarity: string;
}

export interface StoneRateLookupResponse {
  rate: number;
}

export type LabourChargeType = 'AMOUNT' | 'PERCENTAGE';

export interface LabourRate {
  id?: string;
  chargeType: LabourChargeType;
  value: number;
  updatedAt?: string;
}

export interface UpsertLabourRatePayload {
  chargeType: LabourChargeType;
  value: number;
}
