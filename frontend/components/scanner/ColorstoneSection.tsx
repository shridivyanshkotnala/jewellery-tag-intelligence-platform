import { useCallback, useEffect } from 'react';
import { View } from 'react-native';

import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import { QualityField } from '@/components/scanner/QualityField';
import { RateField } from '@/components/scanner/RateField';
import { RateNotFoundModal } from '@/components/scanner/RateNotFoundModal';
import { useStoneRateFetch } from '@/hooks/useStoneRateFetch';
import { buildQuality } from '@/utils/qualityUtils';

export interface ColorstoneSectionValues {
  weight: string;
  color: string;
  clarity: string;
  quality: string;
  rate: string;
}

interface ColorstoneSectionProps {
  title?: string;
  values: ColorstoneSectionValues;
  onChange: (values: Partial<ColorstoneSectionValues>) => void;
  onRateErrorChange?: (hasError: boolean) => void;
  disabled?: boolean;
}

export function ColorstoneSection({
  title = 'Colorstone Details',
  values,
  onChange,
  onRateErrorChange,
  disabled = false,
}: ColorstoneSectionProps) {
  const hasColorClarity = Boolean(values.color.trim() && values.clarity.trim());
  const quality = buildQuality(values.color, values.clarity);

  const handleRateFetched = useCallback(
    (fetchedRate: string) => {
      onChange({ rate: fetchedRate });
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
    type: 'colorstone',
    color: values.color,
    clarity: values.clarity,
    enabled: hasColorClarity && !disabled,
    onRateFetched: handleRateFetched,
  });

  useEffect(() => {
    onRateErrorChange?.(rateNotFound);
  }, [rateNotFound, onRateErrorChange]);

  const handleColorChange = (color: string) => {
    onChange({ color, quality: buildQuality(color, values.clarity) });
  };

  const handleClarityChange = (clarity: string) => {
    onChange({ clarity, quality: buildQuality(values.color, clarity) });
  };

  const inputsDisabled = disabled || isFetching;

  return (
    <>
      <FormSection title={title}>
        <View className="flex-row flex-wrap justify-between">
          <View className="mb-1 w-[48%]">
            <FormInput
              label="CS Weight (ct)"
              value={values.weight}
              onChangeText={(weight) => onChange({ weight })}
              editable={!inputsDisabled}
              placeholder="e.g. 4.26"
            />
          </View>
          <View className="mb-1 w-[48%]">
            <FormInput
              label="CS Color"
              value={values.color}
              onChangeText={handleColorChange}
              editable={!inputsDisabled}
              placeholder="e.g. Red"
            />
          </View>
          <View className="mb-1 w-[48%]">
            <FormInput
              label="CS Clarity"
              value={values.clarity}
              onChangeText={handleClarityChange}
              editable={!inputsDisabled}
              placeholder="e.g. VVS"
            />
          </View>
          <QualityField label="CS Quality" value={quality} />
        </View>
        <RateField label="CS Rate (₹/ct)" value={values.rate} isFetching={isFetching} />
      </FormSection>

      <RateNotFoundModal
        visible={showRateNotFoundModal}
        quality={notFoundQuality}
        onCancel={dismissRateNotFoundModal}
        onRefresh={fetchRate}
        onRetry={fetchRate}
      />
    </>
  );
}
