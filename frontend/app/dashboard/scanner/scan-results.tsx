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

export default function ScanResultsScreen() {
  const router = useRouter();
  const scanData = useScannerStore((s) => s.scanData);
  const selectedType = useScannerStore((s) => s.selectedType);
  const result = MOCK_SCAN_RESULT;

  const grossWt = scanData.grossWt || result.rawMaterial.grossWt;
  const netWt = scanData.netWt || result.rawMaterial.netWt;
  const pureWt = scanData.pureWt || result.rawMaterial.pureWt;
  const tunch = scanData.tunch || result.rawMaterial.tunch;
  const diamondRate = scanData.diamondRate || result.stoneType.rate;
  const diamondQuality = scanData.diamondQuality || result.stoneType.quality;
  const diamondWeight = scanData.diamondWeight || result.stoneType.weight;
  const diamondAmount = scanData.diamondAmount || result.stoneType.amount;
  const labour = scanData.labour || (isDemoScanMode() ? result.costSummary.labour : '');

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
        amount={`₹${result.netPrice.toLocaleString('en-IN')}`}
        subtitle={result.gstNote}
      />

      <DataGridSection
        title="Raw Material"
        badge={selectedType || result.rawMaterial.type}
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
        wastage={result.costSummary.wastage}
        labour={labour}
        otherCharges={result.costSummary.otherCharges}
        total={result.costSummary.total}
      />
    </ScanScreenWrapper>
  );
}
