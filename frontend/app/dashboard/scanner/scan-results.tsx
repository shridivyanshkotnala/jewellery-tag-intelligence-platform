import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';

import { CostSummaryCard } from '@/components/scanner/CostSummaryCard';
import { DataGridSection } from '@/components/scanner/DataGridSection';
import { OutlineButton } from '@/components/scanner/OutlineButton';
import { PriceCard } from '@/components/scanner/PriceCard';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { MOCK_SCAN_RESULT } from '@/constants/scannerData';
import { isDemoScanMode } from '@/constants/scanMode';
import { useScannerStore } from '@/store/scannerStore';
import { formatLabourDisplay } from '@/utils/labourUtils';

function formatCurrency(value: string | number | undefined, fallback = '0'): string {
  const numeric = Number(String(value ?? fallback).replace(/[^\d.]/g, ''));
  if (Number.isNaN(numeric)) return '₹0';
  return `₹${numeric.toLocaleString('en-IN')}`;
}

export default function ScanResultsScreen() {
  const router = useRouter();
  const scanData = useScannerStore((s) => s.scanData);
  const selectedType = useScannerStore((s) => s.selectedType);
  const demoResult = isDemoScanMode() ? MOCK_SCAN_RESULT : null;

  const grossWt = scanData.grossWt || demoResult?.rawMaterial.grossWt || '—';
  const netWt = scanData.netWt || demoResult?.rawMaterial.netWt || '—';
  const pureWt = scanData.pureWt || demoResult?.rawMaterial.pureWt || '—';
  const tunch = scanData.tunch || demoResult?.rawMaterial.tunch || '—';
  const diamondRate = scanData.diamondRate || demoResult?.stoneType.rate || '—';
  const diamondQuality = scanData.diamondQuality || demoResult?.stoneType.quality || '—';
  const diamondWeight = scanData.diamondWeight || demoResult?.stoneType.weight || '—';
  const diamondAmount = scanData.diamondAmount || demoResult?.stoneType.amount || '—';
  const labour =
    formatLabourDisplay(scanData) || demoResult?.costSummary.labour || '—';
  const netPrice = demoResult?.netPrice;
  const wastage = demoResult?.costSummary.wastage || '—';
  const otherCharges = demoResult?.costSummary.otherCharges || '—';
  const total = demoResult?.costSummary.total || '—';

  return (
    <ScanScreenWrapper
      title="Scan Results"
      className="bg-surface-muted"
      scanButtonVariant="green"
      footer={
        <View className="flex-row gap-3">
          <OutlineButton
            title="Add to Wishlist"
            onPress={() => {}}
            icon={<Heart size={18} color="#1A332E" />}
          />
          <PrimaryGreenButton
            title="Generate Invoice"
            onPress={() => router.push('/dashboard/scanner/invoice-preview')}
          />
        </View>
      }
    >
      <BackgroundPattern />

      <PriceCard
        label="Net Calculated Price"
        amount={formatCurrency(netPrice)}
        subtitle={demoResult?.gstNote ?? 'GST included where applicable'}
      />

      <DataGridSection
        title="Raw Material"
        badge={selectedType || demoResult?.rawMaterial.type || 'Item'}
        items={[
          { label: 'Gross Wt.', value: grossWt },
          { label: 'Net Wt.', value: netWt },
          { label: 'Pure Wt.', value: pureWt },
          { label: 'Tunch', value: tunch, showDropdown: true },
        ]}
      />

      <DataGridSection
        title="Stone Type"
        badge="Diamond"
        items={[
          { label: 'Diamond Rate', value: diamondRate },
          { label: 'Diamond Quality', value: diamondQuality },
          { label: 'Diamond Weight', value: diamondWeight },
          { label: 'Diamond Amount', value: diamondAmount },
        ]}
      />

      <CostSummaryCard
        wastage={wastage}
        labour={labour}
        otherCharges={otherCharges}
        total={total}
      />
    </ScanScreenWrapper>
  );
}
