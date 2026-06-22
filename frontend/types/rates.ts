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
}

export interface GoldRatesResponse {
  mcxLiveRate: number;
  rates: GoldRate[];
}

export interface UpdateGoldRatePayload {
  carat: string;
  purity: number;
  increaseByAmount: number;
  increaseByType: GoldIncreaseByType;
}

export interface StoneRate {
  id?: string;
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
