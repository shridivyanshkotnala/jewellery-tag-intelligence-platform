import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { DataGridSection } from '@/components/scanner/DataGridSection';
import {
  KARAT_DROPDOWN_OPTIONS,
  type FinalTabPricingResult,
} from '@/utils/scanPriceCalculation';

interface RawMaterialGoldSectionProps {
  badge: string;
  pricing: FinalTabPricingResult;
  onKaratChange?: (karat: string) => void;
}

function KaratDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (karat: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="mt-1.5 flex-row items-center justify-between"
      >
        <Text className="text-sm text-text-secondary">{value || 'Select karat'}</Text>
        <ChevronDown size={14} color="#757575" />
      </Pressable>
      {open ? (
        <View className="absolute left-0 right-0 top-8 z-20 overflow-hidden rounded-input border border-border bg-white shadow-md">
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
                className={`text-sm ${option === value ? 'font-semibold text-primary' : 'text-text-secondary'}`}
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

export function RawMaterialGoldSection({
  badge,
  pricing,
  onKaratChange,
}: RawMaterialGoldSectionProps) {
  const purityNote =
    pricing.puritySource === 'labourOverride'
      ? `${pricing.effectivePurityPercent}% (custom purity)`
      : pricing.puritySource === 'tunchOverride'
        ? `${pricing.effectivePurityPercent}% (admin override)`
        : `${pricing.effectivePurityPercent}%`;

  return (
    <DataGridSection
      title="Raw Material"
      badge={badge}
      items={[
        { label: 'Gross Wt.', value: pricing.grossWtDisplay },
        { label: 'Net Wt.', value: pricing.netWtDisplay },
        {
          label: 'Tunch Purity',
          value: pricing.selectedKarat,
          showDropdown: true,
        },
        {
          label: 'Pure Wt.',
          value: `${pricing.pureWtDisplay} (${purityNote})`,
        },
      ]}
    />
  );
}

export function RawMaterialGoldSectionInteractive({
  badge,
  pricing,
  onKaratChange,
}: RawMaterialGoldSectionProps) {
  const purityNote =
    pricing.puritySource === 'labourOverride'
      ? `${pricing.effectivePurityPercent}% (custom purity)`
      : pricing.puritySource === 'tunchOverride'
        ? `${pricing.effectivePurityPercent}% (admin override)`
        : `${pricing.effectivePurityPercent}% from backend`;

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="text-sm font-bold uppercase text-text-primary">Raw Material</Text>
        <View className="rounded-full bg-primary px-3 py-1">
          <Text className="text-xs font-semibold text-white">{badge}</Text>
        </View>
      </View>

      <View className="flex-row border-b border-border">
        <View className="flex-1 border-r border-border p-4">
          <Text className="text-xs text-text-muted">Gross Wt.</Text>
          <Text className="mt-1.5 text-sm text-text-secondary">{pricing.grossWtDisplay}</Text>
        </View>
        <View className="flex-1 p-4">
          <Text className="text-xs text-text-muted">Net Wt.</Text>
          <Text className="mt-1.5 text-sm text-text-secondary">{pricing.netWtDisplay}</Text>
        </View>
      </View>

      <View className="flex-row">
        <View className="flex-1 border-r border-border p-4">
          <Text className="text-xs text-text-muted">Tunch Purity</Text>
          {onKaratChange ? (
            <KaratDropdown
              value={pricing.selectedKarat}
              options={KARAT_DROPDOWN_OPTIONS}
              onChange={onKaratChange}
            />
          ) : (
            <Text className="mt-1.5 text-sm text-text-secondary">{pricing.selectedKarat}</Text>
          )}
          <Text className="mt-1 text-[10px] text-text-muted">{purityNote}</Text>
        </View>
        <View className="flex-1 p-4">
          <Text className="text-xs text-text-muted">Pure Wt.</Text>
          <Text className="mt-1.5 text-sm text-text-secondary">{pricing.pureWtDisplay}</Text>
          <Text className="mt-1 text-[10px] text-text-muted">Net wt × % purity</Text>
        </View>
      </View>
    </View>
  );
}
