import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { ToastNotification, type ToastType } from '@/components/scanner/ToastNotification';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useRequireMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
import type { GoldRate } from '@/types/rates';
import { ApiError } from '@/utils/apiClient';
import { formatKaratLabel } from '@/utils/goldRateUtils';
import { fetchGoldRates } from '@/utils/ratesApi';

const CARAT_ORDER = ['22Kt', '20Kt', '18Kt', '14Kt', '9Kt'];

function sortGoldRates(rates: GoldRate[]): GoldRate[] {
  return [...rates].sort((a, b) => {
    const ai = CARAT_ORDER.indexOf(a.carat);
    const bi = CARAT_ORDER.indexOf(b.carat);
    if (ai === -1 && bi === -1) return a.carat.localeCompare(b.carat);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function formatDateBox() {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = now.getDate();
  return { dayName, dateNum };
}

export default function MarketRatesScreen() {
  const allowed = useRequireMarketRatesAccess();
  const [loading, setLoading] = useState(true);
  const [mcxLiveRate, setMcxLiveRate] = useState(0);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const sortedGoldRates = useMemo(() => sortGoldRates(goldRates), [goldRates]);
  const dateInfo = useMemo(() => formatDateBox(), []);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      const gold = await fetchGoldRates();
      setMcxLiveRate(gold.mcxLiveRate);
      setGoldRates(gold.rates);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to load market rates. Please try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (allowed) void loadRates();
    }, [allowed, loadRates]),
  );

  if (!allowed) return null;

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView
        contentContainerStyle={[screenStyles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Today Market{'\n'}Overview</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>{dateInfo.dayName}</Text>
            <Text style={styles.dateNum}>{dateInfo.dateNum}</Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          <View style={styles.activeTab}>
            <Text style={styles.activeTabText}>Gold</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#1B3022" />
            <Text style={styles.loadingText}>Loading live MCX rates...</Text>
          </View>
        ) : (
          <View style={styles.contentSection}>
            <View style={styles.mcxTopCard}>
              <Text style={styles.mcxTopLabel}>MCX Gold Rate (24 Kt)</Text>
              <Text style={styles.mcxTopValue}>₹ {mcxLiveRate.toLocaleString('en-IN')}</Text>
            </View>

            {sortedGoldRates.map((rate) => (
              <View key={rate.carat} style={styles.rateCard}>
                <View style={styles.rateCardHeader}>
                  <Text style={styles.cardKaratLabel}>Gold ({formatKaratLabel(rate.carat)}) MCX</Text>
                  <Text style={styles.cardMcxValue}>₹ {rate.mcxRate?.toLocaleString('en-IN') || 0}</Text>
                </View>

                <View style={styles.rateCardBody}>
                  <View style={styles.rateBoxLeft}>
                    <Text style={styles.cashRateValue}>₹ {rate.cashRate?.toLocaleString('en-IN') || 0}</Text>
                    <Text style={styles.rateSubtitle}>(Cash Rate)</Text>
                  </View>
                  <View style={styles.rateBoxRight}>
                    <Text style={styles.rtgsRateValue}>₹ {rate.rtgsRate?.toLocaleString('en-IN') || 0}</Text>
                    <Text style={styles.rateSubtitle}>(RTGS Rate)</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 34,
  },
  dateBox: {
    backgroundColor: '#D6C09D',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  dateNum: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  activeTab: {
    backgroundColor: '#D6C09D',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingWrap: { paddingVertical: 48, alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: 14, color: Colors.textMuted },
  contentSection: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  mcxTopCard: {
    borderWidth: 2,
    borderColor: '#2A4676', // Pen color from the sketch
    borderRadius: 8,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  mcxTopLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A4676',
  },
  mcxTopValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A4676',
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardKaratLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardMcxValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rateCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateBoxLeft: {
    flex: 1,
  },
  rateBoxRight: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  cashRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  rtgsRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  rateSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
