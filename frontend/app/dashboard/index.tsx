import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
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

const ACCENT_GOLD = '#D4C19C';
const TAB_INACTIVE = '#F2F2F7';

export default function DashboardScreen() {
  const { canEditMarketRates } = useMarketRatesAccess();
  const [loading, setLoading] = useState(true);
  const [mcxLiveRate, setMcxLiveRate] = useState<number | null>(null);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  
  const sortedGoldRates = useMemo(() => sortGoldRates(goldRates), [goldRates]);
  const today = new Date();
  const dayLabel = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = today.getDate();

  const loadMarketData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const gold = await fetchGoldRates();
      setMcxLiveRate(gold.mcxLiveRate);
      setGoldRates(gold.rates);
    } catch (error) {
      if (showLoader) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Failed to load market rates. Showing last known values.';
        Alert.alert('Market Data', message);
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMarketData();
    }, [loadMarketData]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader />

        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>
            Today Market{'\n'}Overview
          </Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{dayLabel}</Text>
            <Text style={styles.dateNum}>{dateNum}</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.tabPill}>
            <View style={styles.tabBtnActive}>
              <Text style={styles.tabTextActive}>Gold</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardsWrap}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={Colors.primaryNav} />
              <Text style={styles.loadingText}>Loading live MCX rates...</Text>
            </View>
          ) : (
            <>
              {mcxLiveRate != null ? (
                <View style={styles.mcxTopCard}>
                  <Text style={styles.mcxTopLabel}>MCX Gold Rate (24 Kt)</Text>
                  <Text style={styles.mcxTopValue}>₹ {mcxLiveRate.toLocaleString('en-IN')}</Text>
                </View>
              ) : null}

              {sortedGoldRates.length > 0 ? (
                sortedGoldRates.map((rate) => (
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
                ))
              ) : (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No gold rates available</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.screenBottom + 80,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: Spacing.lg,
  },
  pageTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    color: '#000000',
  },
  dateBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: ACCENT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  dateNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  tabPill: {
    flexDirection: 'row',
    backgroundColor: TAB_INACTIVE,
    borderRadius: 24,
    padding: 4,
  },
  tabBtnActive: {
    backgroundColor: ACCENT_GOLD,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  tabTextActive: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardsWrap: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: { 
    fontSize: 14, 
    color: Colors.textMuted 
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  mcxTopCard: {
    borderWidth: 2,
    borderColor: '#2A4676',
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
