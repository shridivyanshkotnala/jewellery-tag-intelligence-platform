export type JewelleryType = 'Diamond' | 'Gold' | 'Silver' | 'Colour Stone';

export type ApiJewelleryType = 'DIAMOND' | 'GOLD' | 'SILVER' | 'COLOUR_STONE';

export type ApiScanType = 'SINGLE_SIDE' | 'BOTH_SIDES';

export type ScanStatus =
  | 'WAITING_FOR_SCAN'
  | 'FRONT_IMAGE_RECEIVED'
  | 'BACK_IMAGE_RECEIVED'
  | 'READY_FOR_REVIEW'
  | 'APPROVED';

export type StructuredScanData = Record<string, string>;

export interface CreateScanResponse {
  scanId: string;
  status: ScanStatus;
}

export interface ImageUploadResponse {
  success?: boolean;
  status: ScanStatus;
}

export interface UnknownField {
  abbreviation: string;
  detectedValue?: string;
}

export interface AnalyzeScanResponse {
  success?: boolean;
  scanId: string;
  status: ScanStatus;
  structuredData?: StructuredScanData;
  unknownFields: UnknownField[];
}

export interface ClarificationField {
  abbreviation: string;
  detectedValue: string;
  suggestedField: string;
  confidence: number;
  availableFields: string[];
}

export interface ClarificationResponse {
  scanId: string;
  fieldsNeedingReview: ClarificationField[];
}

export interface ConfirmedMapping {
  abbreviation: string;
  mappedField: string;
  description?: string;
}

export interface SubmitClarificationRequest {
  confirmedMappings: ConfirmedMapping[];
}

export interface SubmitClarificationResponse {
  success?: boolean;
  status: ScanStatus;
}

export interface ReviewResponse {
  scanId: string;
  status: ScanStatus;
  structuredData: StructuredScanData;
}

export interface SubmitReviewResponse {
  success?: boolean;
  status: ScanStatus;
}

export type OcrProcessingState = 'scanning' | 'processing' | 'success' | 'error';

export type BottomNavRoute = 'home' | 'scanner' | 'ai';

export type ScanMode = 'single' | 'both';

export type ScanSide = 'front' | 'back';

export type AbbreviationOption =
  | 'Gross Wt'
  | 'Net Wt'
  | 'Pure Wt'
  | 'Diamond Rate'
  | 'Diamond Quality'
  | 'Diamond Pieces'
  | 'Gold Rate'
  | 'Gold Quality'
  | 'Gold Pieces'
  | 'Silver Rate'
  | 'Silver Quality'
  | 'Silver Pieces'
  | 'Colour Stone Rate'
  | 'Colour Stone Quality'
  | 'Colour Stone Pieces'
  | 'Labour'
  | 'Other';

export interface ScanItemData {
  sku: string;
  category: JewelleryType;
  grossWt: string;
  netWt: string;
  pureWt: string;
  tunch: string;
  diamondRate: string;
  diamondQuality: string;
  diamondWeight: string;
  diamondPieces: string;
  labour: string;
  diamondAmount: string;
}

export interface FormulaRule {
  id: string;
  name: string;
  expression: string;
  isActive: boolean;
}

export interface FormulaItem {
  id: string;
  name: string;
  description: string;
  rulesCount: number;
  lastUsed: string;
  isActive: boolean;
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface ScanResultData {
  netPrice: number;
  gstNote: string;
  rawMaterial: {
    type: JewelleryType;
    grossWt: string;
    netWt: string;
    pureWt: string;
    tunch: string;
  };
  stoneType: {
    type: JewelleryType;
    rate: string;
    quality: string;
    weight: string;
    amount: string;
  };
  costSummary: {
    wastage: string;
    labour: string;
    otherCharges: string;
    total: string;
  };
}

export interface MappedField {
  id: string;
  label: string;
  sourceValue: string;
  targetField: string;
  confidence: number;
}

export interface ExtractionField {
  id: string;
  label: string;
  value: string;
  status: 'matched' | 'pending' | 'missing';
}
