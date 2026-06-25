import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Printer } from 'lucide-react-native';

import { InvoiceGenerationBilling } from '@/components/scanner/InvoiceGenerationBilling';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useScannerStore } from '@/store/scannerStore';
import { resolveInvoiceNumber } from '@/utils/invoiceCalculation';
import { parseStoneArraysFromStructuredData } from '@/utils/stoneSequenceUtils';

type PrintState = 'preparing' | 'printing' | 'success';

export default function PrintInvoiceScreen() {
  const router = useRouter();
  const [printState, setPrintState] = useState<PrintState>('preparing');

  const scanData = useScannerStore((state) => state.scanData);
  const structuredData = useScannerStore((state) => state.structuredData);
  const scanId = useScannerStore((state) => state.scanId);

  const { diamonds, colorstones } = useMemo(
    () => parseStoneArraysFromStructuredData(structuredData, scanData),
    [structuredData, scanData],
  );

  const invoiceNumber = useMemo(
    () => resolveInvoiceNumber(scanId, scanData.sku),
    [scanId, scanData.sku],
  );

  useEffect(() => {
    if (printState === 'preparing') {
      const timer = setTimeout(() => setPrintState('printing'), 1200);
      return () => clearTimeout(timer);
    }
    if (printState === 'printing') {
      const timer = setTimeout(() => setPrintState('success'), 2000);
      return () => clearTimeout(timer);
    }
  }, [printState]);

  return (
    <ScanScreenWrapper
      title="Print Invoice"
      className="bg-surface-muted"
      scanButtonVariant="green"
      footer={
        printState === 'success' ? (
          <PrimaryGreenButton title="Back to Home" onPress={() => router.push('/dashboard')} />
        ) : undefined
      }
    >
      <BackgroundPattern />

      {printState === 'preparing' || printState === 'printing' ? (
        <View className="mb-6 items-center rounded-2xl border border-border bg-white py-10">
          <ActivityIndicator size="large" color="#1A332E" />
          <View className="mt-4 flex-row items-center gap-2">
            <Printer size={20} color="#1A332E" />
            <Text className="text-base font-semibold text-text-primary">
              {printState === 'preparing' ? 'Preparing invoice...' : 'Sending to printer...'}
            </Text>
          </View>
          <Text className="mt-2 text-sm text-text-secondary">
            Please wait while the invoice is being processed
          </Text>
        </View>
      ) : (
        <View className="mb-6 items-center rounded-2xl bg-success-bg py-6">
          <CheckCircle2 size={48} color="#34A853" />
          <Text className="mt-3 text-lg font-bold text-success-text">Invoice Printed</Text>
          <Text className="mt-1 text-sm text-text-secondary">
            Invoice {invoiceNumber} sent to printer successfully
          </Text>
        </View>
      )}

      <InvoiceGenerationBilling
        scanData={scanData}
        structuredData={structuredData}
        diamonds={diamonds}
        colorstones={colorstones}
        scanId={scanId}
        readOnly
      />
    </ScanScreenWrapper>
  );
}
