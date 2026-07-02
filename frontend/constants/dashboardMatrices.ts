export type MatrixKey =
  | '22k_with_tax'
  | '22k_without_tax'
  | '20k_with_tax'
  | '20k_without_tax'
  | '18k_with_tax'
  | '18k_without_tax'
  | '14k_with_tax'
  | '14k_without_tax'
  | '9k_with_tax'
  | '9k_without_tax'
  | 'mcx_with_tax'
  | 'mcx_without_tax'
  | 'edit_market_prices';

export interface MatrixRow {
  key: MatrixKey;
  label: string;
}

export interface MatrixSection {
  sectionLabel: string;
  rows: MatrixRow[];
}

export const GOLD_MATRIX_SECTIONS: MatrixSection[] = [
  {
    sectionLabel: '22K GOLD',
    rows: [
      { key: '22k_with_tax', label: '22K With Tax' },
      { key: '22k_without_tax', label: '22K Without Tax' },
    ],
  },
  {
    sectionLabel: '20K GOLD',
    rows: [
      { key: '20k_with_tax', label: '20K With Tax' },
      { key: '20k_without_tax', label: '20K Without Tax' },
    ],
  },
  {
    sectionLabel: '18K GOLD',
    rows: [
      { key: '18k_with_tax', label: '18K With Tax' },
      { key: '18k_without_tax', label: '18K Without Tax' },
    ],
  },
  {
    sectionLabel: '14K GOLD',
    rows: [
      { key: '14k_with_tax', label: '14K With Tax' },
      { key: '14k_without_tax', label: '14K Without Tax' },
    ],
  },
  {
    sectionLabel: '9K GOLD',
    rows: [
      { key: '9k_with_tax', label: '9K With Tax' },
      { key: '9k_without_tax', label: '9K Without Tax' },
    ],
  },
  {
    sectionLabel: '14k MCX RATE',
    rows: [
      { key: 'mcx_with_tax', label: 'MCX Rate With Tax' },
      { key: 'mcx_without_tax', label: 'MCX Rate Without Tax' },
    ],
  },
];

export const DEFAULT_MATRIX_VALUES: Record<MatrixKey, boolean> = {
  '22k_with_tax': true,
  '22k_without_tax': false,
  '20k_with_tax': true,
  '20k_without_tax': false,
  '18k_with_tax': true,
  '18k_without_tax': false,
  '14k_with_tax': true,
  '14k_without_tax': false,
  '9k_with_tax': true,
  '9k_without_tax': false,
  'mcx_with_tax': true,
  'mcx_without_tax': false,
  'edit_market_prices': true
};
