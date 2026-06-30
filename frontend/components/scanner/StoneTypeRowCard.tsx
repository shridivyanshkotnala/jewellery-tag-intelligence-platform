import { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';

import { FormFieldGrid, FormFieldGridItem } from '@/components/scanner/FormFieldGrid';
import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import { RateField } from '@/components/scanner/RateField';
import { RateNotFoundModal } from '@/components/scanner/RateNotFoundModal';
import { useStoneRateFetch } from '@/hooks/useStoneRateFetch';
import type { StoneKind } from '@/types/scanner';
import { buildQuality } from '@/utils/qualityUtils';
import { computeStoneAmount } from '@/utils/scanPriceCalculation';
import { parseWeightValue } from '@/utils/formulaUtils';
import { parseNumericLabourValue } from '@/utils/labourUtils';

export interface StoneTypeRowValues {
  weight: string;
  color: string;
  clarity: string;
  quality: string;
  rate: string;
  shape?: string;
}

interface StoneTypeRowCardProps {
  title: string;
  stoneType: StoneKind;
  values: StoneTypeRowValues;
  editable?: boolean;
  onChange?: (values: Partial<StoneTypeRowValues>) => void;
  onRateErrorChange?: (hasError: boolean) => void;
}

const STONE_LABELS: Record<StoneKind, { rate: string; quality: string; weight: string; amount: string }> = {
  diamond: {
    rate: 'Diamond Rate',
    quality: 'Diamond Quality',
    weight: 'Diamond Wt (Ct)',
    amount: 'Diamond Amount',
  },
  colorstone: {
    rate: 'CS Rate',
    quality: 'CS Quality',
    weight: 'CS Wt (Ct)',
    amount: 'CS Amount',
  },
};

function formatInr(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function StoneTypeRowCard({
  title,
  stoneType,
  values,
  editable = false,
  onChange,
  onRateErrorChange,
}: StoneTypeRowCardProps) {
  const labels = STONE_LABELS[stoneType];
  const quality = values.quality || buildQuality(values.color, values.clarity);
  const weightCt = parseWeightValue(values.weight);
  const rate = parseNumericLabourValue(values.rate) ?? 0;
  const amount = computeStoneAmount(values.weight, values.rate);

  const hasColorClarity = Boolean(values.color.trim() && values.clarity.trim());

  const handleRateFetched = useCallback(
    (fetchedRate: string) => {
      onChange?.({ rate: fetchedRate });
    },
    [onChange],
  );

  const {
    isFetching,
    rateNotFound,
    showRateNotFoundModal,
    notFoundQuality,
    fetchRate,
    dismissRateNotFoundModal,
  } = useStoneRateFetch({
    type: stoneType,
    color: values.color,
    clarity: values.clarity,
    enabled: editable && hasColorClarity,
    onRateFetched: handleRateFetched,
  });

  useEffect(() => {
    onRateErrorChange?.(rateNotFound);
  }, [rateNotFound, onRateErrorChange]);

  const handleColorChange = (color: string) => {
    onChange?.({ color, quality: buildQuality(color, values.clarity) });
  };

  const handleClarityChange = (clarity: string) => {
    onChange?.({ clarity, quality: buildQuality(values.color, clarity) });
  };

  return (
    <>
      <FormSection title={title} variant="card">
        {editable ? (
          <FormFieldGrid>
            <FormFieldGridItem>
              <FormInput
                label={`${labels.weight} (edit)`}
                value={values.weight}
                onChangeText={(weight) => onChange?.({ weight })}
                editable={!isFetching}
                placeholder="from scan result"
                containerClassName="mb-2.5"
              />
            </FormFieldGridItem>
            <FormFieldGridItem>
              <FormInput
                label="Color"
                value={values.color}
                onChangeText={handleColorChange}
                editable={!isFetching}
                placeholder="e.g. GH"
                containerClassName="mb-2.5"
              />
            </FormFieldGridItem>
            <FormFieldGridItem>
              <FormInput
                label="Clarity"
                value={values.clarity}
                onChangeText={handleClarityChange}
                editable={!isFetching}
                placeholder="e.g. VVS"
                containerClassName="mb-2.5"
              />
            </FormFieldGridItem>
            <FormFieldGridItem>
              <FormInput
                label={`${labels.rate} (Manual)`}
                value={values.rate}
                onChangeText={(text) => onChange?.({ rate: text.replace(/[^0-9.]/g, '') })}
                editable={!isFetching}
                placeholder="Enter override rate"
                keyboardType="decimal-pad"
                containerClassName="mb-2.5"
              />
            </FormFieldGridItem>
          </FormFieldGrid>
        ) : null}

        <FormFieldGrid>
          <FormFieldGridItem>
            <FormInput
              label={labels.rate}
              value={isFetching ? '' : values.rate ? `₹${values.rate}/ct` : ''}
              editable={false}
              placeholder="from scan result"
              containerClassName="mb-2.5"
            />
            {editable && isFetching ? (
              <RateField label="" value="" isFetching />
            ) : null}
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label={labels.quality}
              value={quality}
              editable={false}
              placeholder="color + clarity"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label={labels.weight}
              value={values.weight ? `${values.weight} ct` : ''}
              onChangeText={(weight) => editable && onChange?.({ weight })}
              editable={editable && !isFetching}
              placeholder="from scan result"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <View className="mb-2.5">
              <Text className="mb-1.5 text-xs font-medium text-text-secondary">
                {labels.amount}
              </Text>
              <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
                <Text className="text-sm font-semibold text-text-primary">
                  {formatInr(amount)}
                </Text>
                <Text className="mt-0.5 text-[10px] text-text-muted">
                  {weightCt > 0 && rate > 0 ? `${weightCt} ct × ₹${rate}/ct` : 'Wt × Rate'}
                </Text>
              </View>
            </View>
          </FormFieldGridItem>
        </FormFieldGrid>
      </FormSection>

      {editable ? (
        <RateNotFoundModal
          visible={showRateNotFoundModal}
          quality={notFoundQuality}
          onCancel={dismissRateNotFoundModal}
          onRefresh={fetchRate}
          onRetry={fetchRate}
        />
      ) : null}
    </>
  );
}
