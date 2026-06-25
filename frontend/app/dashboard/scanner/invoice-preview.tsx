import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Printer } from 'lucide-react-native';

import { InvoiceGenerationBilling } from '@/components/scanner/InvoiceGenerationBilling';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useScannerStore } from '@/store/scannerStore';
import { parseStoneArraysFromStructuredData } from '@/utils/stoneSequenceUtils';

export default function InvoicePreviewScreen() {
  const router = useRouter();
  const scanData = useScannerStore((state) => state.scanData);
  const structuredData = useScannerStore((state) => state.structuredData);
  const scanId = useScannerStore((state) => state.scanId);

  const { diamonds, colorstones } = useMemo(
    () => parseStoneArraysFromStructuredData(structuredData, scanData),
    [structuredData, scanData],
  );

  return (
    <ScanScreenWrapper
      title="Invoice Generation & Billing"
      className="bg-surface-muted"
      scanButtonVariant="green"
      footer={
        <PrimaryGreenButton
          title="Print Invoice"
          onPress={() => router.push('/dashboard/scanner/print-invoice')}
          icon={<Printer size={18} color="#FFFFFF" />}
        />
      }
    >
      <BackgroundPattern />

      <InvoiceGenerationBilling
        scanData={scanData}
        structuredData={structuredData}
        diamonds={diamonds}
        colorstones={colorstones}
        scanId={scanId}
      />
    </ScanScreenWrapper>
  );
}
