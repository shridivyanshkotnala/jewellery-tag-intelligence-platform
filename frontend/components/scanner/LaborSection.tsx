import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown, Pencil } from 'lucide-react-native';

import { FormSection } from '@/components/scanner/FormSection';
import { Colors } from '@/constants/theme';
import type { LabourChargeUnit } from '@/constants/labour';
import { useLabourChargeUnits } from '@/hooks/useLabourChargeUnits';
import type { ScanItemData } from '@/types/scanner';
import {
  hasActiveLabourCharge,
  hasActiveLabourPurity,
  validateLabour,
} from '@/utils/labourUtils';

export interface LaborSectionValues {
  labourPurityPercent: string;
  labourChargeAmount: string;
  labourChargeUnit: LabourChargeUnit;
}

interface LaborSectionProps {
  values: LaborSectionValues;
  onChange: (values: Partial<LaborSectionValues>) => void;
  layout?: 'form' | 'review';
  showValidationError?: boolean;
  unitOptions?: LabourChargeUnit[];
}

function sanitizePurityInput(text: string): string {
  const digits = text.replace(/[^0-9.]/g, '');
  if (!digits) return '';
  return `${digits}%`;
}

function sanitizeChargeAmount(text: string): string {
  return text.replace(/[₹,\s]/g, '');
}

interface LaborFieldRowProps {
  label: string;
  disabled: boolean;
  children: React.ReactNode;
  required?: boolean;
}

function LaborFieldRow({ label, disabled, children, required = false }: LaborFieldRowProps) {
  return (
    <View className={`mb-3 flex-row items-center gap-3 ${disabled ? 'opacity-45' : ''}`}>
      <Text className="w-[118px] text-sm font-semibold text-text-primary">
        {label}
        {required ? <Text className="text-danger-text">*</Text> : null}
      </Text>
      <View className="flex-1">{children}</View>
    </View>
  );
}

function UnitDropdown({
  value,
  options,
  onChange,
  disabled,
}: {
  value: LabourChargeUnit;
  options: LabourChargeUnit[];
  onChange: (unit: LabourChargeUnit) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="relative">
      <Pressable
        onPress={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="h-[42px] min-w-[118px] flex-row items-center justify-between rounded-input border border-border bg-white px-3"
      >
        <Text className="text-xs text-text-primary" numberOfLines={1}>
          {value}
        </Text>
        <ChevronDown size={14} color="#757575" />
      </Pressable>
      {open && !disabled ? (
        <View className="absolute right-0 top-[46px] z-20 min-w-[140px] overflow-hidden rounded-input border border-border bg-white shadow-md">
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`px-3 py-2.5 ${option === value ? 'bg-primary/10' : 'bg-white'}`}
            >
              <Text
                className={`text-xs ${option === value ? 'font-semibold text-primary' : 'text-text-primary'}`}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function LaborSection({
  values,
  onChange,
  layout = 'review',
  showValidationError = false,
  unitOptions: unitOptionsProp,
}: LaborSectionProps) {
  const fetchedUnits = useLabourChargeUnits();
  const unitOptions = unitOptionsProp ?? fetchedUnits;

  const purityDisabled = hasActiveLabourCharge(values);
  const chargeDisabled = hasActiveLabourPurity(values);
  const validationError = validateLabour(values);

  const handlePurityChange = (text: string) => {
    const next = sanitizePurityInput(text);
    if (!next) {
      onChange({ labourPurityPercent: '' });
      return;
    }
    onChange({
      labourPurityPercent: next,
      labourChargeAmount: '',
    });
  };

  const handleChargeChange = (text: string) => {
    const next = sanitizeChargeAmount(text);
    if (!next) {
      onChange({ labourChargeAmount: '' });
      return;
    }
    onChange({
      labourChargeAmount: next,
      labourPurityPercent: '',
    });
  };

  const handleUnitChange = (labourChargeUnit: LabourChargeUnit) => {
    if (chargeDisabled) return;
    onChange({ labourChargeUnit });
  };

  const purityField = (
    <View className="h-[42px] flex-row items-center rounded-input border border-border bg-white px-3">
      <TextInput
        value={values.labourPurityPercent}
        onChangeText={handlePurityChange}
        placeholder="e.g. 71%"
        editable={!purityDisabled}
        placeholderTextColor={Colors.placeholder}
        keyboardType="decimal-pad"
        className="flex-1 text-sm text-text-primary"
      />
      {!purityDisabled ? <Pencil size={14} color="#757575" /> : null}
    </View>
  );

  const chargeField = (
    <View className="flex-row items-center gap-2">
      <View className="h-[42px] min-w-0 flex-1 flex-row items-center rounded-input border border-border bg-white px-3">
        <Text className="mr-1 text-sm text-text-muted">₹</Text>
        <TextInput
          value={values.labourChargeAmount}
          onChangeText={handleChargeChange}
          placeholder="e.g. 300"
          editable={!chargeDisabled}
          placeholderTextColor={Colors.placeholder}
          keyboardType="number-pad"
          className="flex-1 text-sm text-text-primary"
        />
        {!chargeDisabled ? <Pencil size={14} color="#757575" /> : null}
      </View>
      <UnitDropdown
        value={values.labourChargeUnit}
        options={unitOptions}
        onChange={handleUnitChange}
        disabled={chargeDisabled}
      />
    </View>
  );

  if (layout === 'form') {
    return (
      <FormSection title="Labor">
        <View className={purityDisabled ? 'opacity-45' : ''}>
          <Text className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-label">
            Percentage Purity<Text className="text-danger-text">*</Text>
          </Text>
          {purityField}
        </View>
        <View className={`mt-4 ${chargeDisabled ? 'opacity-45' : ''}`}>
          <Text className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-label">
            Labor Charges<Text className="text-danger-text">*</Text>
          </Text>
          {chargeField}
        </View>
        {showValidationError && validationError ? (
          <Text className="mt-3 text-xs text-danger-text">{validationError}</Text>
        ) : null}
      </FormSection>
    );
  }

  return (
    <FormSection title="Labor">
      <LaborFieldRow label="Percentage Purity" disabled={purityDisabled} required>
        {purityField}
      </LaborFieldRow>
      <LaborFieldRow label="Labor Charges" disabled={chargeDisabled} required>
        {chargeField}
      </LaborFieldRow>
      {showValidationError && validationError ? (
        <Text className="text-xs text-danger-text">{validationError}</Text>
      ) : null}
    </FormSection>
  );
}

export function getLaborValuesFromScanData(
  scanData: Pick<ScanItemData, 'labourPurityPercent' | 'labourChargeAmount' | 'labourChargeUnit'>,
): LaborSectionValues {
  return {
    labourPurityPercent: scanData.labourPurityPercent,
    labourChargeAmount: scanData.labourChargeAmount,
    labourChargeUnit: scanData.labourChargeUnit,
  };
}
