export type LabourChargeUnit = 'Per Gram' | 'Per 10 Gram' | 'Per 1 Gram';

export const DEFAULT_LABOUR_CHARGE_UNITS: LabourChargeUnit[] = [
  'Per Gram',
  'Per 10 Gram',
  'Per 1 Gram',
];

export const DEFAULT_LABOUR_CHARGE_UNIT: LabourChargeUnit = 'Per Gram';

export const LABOUR_VALIDATION_MESSAGE =
  'Please enter either Percentage Purity or Labor Charges.';
