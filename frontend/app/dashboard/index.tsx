import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MarketCard } from '@/components/dashboard/MarketCard';
import { StoneRateCard } from '@/components/dashboard/StoneRateCard';
import { GOLD_MARKET_DATA } from '@/constants/marketData';
import { Colors } from '@/constants/theme';
import { useMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
import type { MarketItem } from '@/types/auth';
import type { StoneRate } from '@/types/rates';
import { ApiError } from '@/utils/apiClient';
import { goldRatesToMarketItems } from '@/utils/rateMappers';
import {
  fetchColorstoneRates,
  fetchDiamondRates,
  fetchGoldRates,
} from '@/utils/ratesApi';

const ACCENT_GOLD = '#D4C19C';
const TAB_INACTIVE = '#F2F2F7';

type MarketTab = 'gold' | 'diamond' | 'colorstone';

export default function DashboardScreen() {
  const router = useRouter();
  const { canEditMarketRates } = useMarketRatesAccess();
  const [activeTab, setActiveTab] = useState<MarketTab>('gold');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [goldItems, setGoldItems] = useState<MarketItem[]>(GOLD_MARKET_DATA);
  const [diamondRates, setDiamondRates] = useState<StoneRate[]>([]);
  const [colorstoneRates, setColorstoneRates] = useState<StoneRate[]>([]);
  const [mcxLiveRate, setMcxLiveRate] = useState<number | null>(null);
  const today = new Date();
  const dayLabel = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = today.getDate();

  const loadMarketData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [gold, diamond, colorstone] = await Promise.all([
        fetchGoldRates(),
        fetchDiamondRates(),
        fetchColorstoneRates(),
      ]);
      setMcxLiveRate(gold.mcxLiveRate);
      setGoldItems(goldRatesToMarketItems(gold.mcxLiveRate, gold.rates));
      setDiamondRates(diamond);
      setColorstoneRates(colorstone);
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
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMarketData();
    }, [loadMarketData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadMarketData(false);
  };

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            <View style={styles.tabPill}>
              {(['gold', 'diamond', 'colorstone'] as MarketTab[]).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab === 'colorstone' ? 'Colorstone' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Pressable onPress={handleRefresh} hitSlop={8} style={styles.refreshBtn}>
            <RefreshCw
              size={22}
              color={Colors.textPrimary}
              style={refreshing ? { opacity: 0.5 } : undefined}
            />
          </Pressable>
        </View>

        {canEditMarketRates ? (
          <Pressable
            onPress={() => router.push('/dashboard/market-rates' as Href)}
            style={styles.editRatesLink}
          >
            <Text style={styles.editRatesText}>Edit Market Rates</Text>
          </Pressable>
        ) : null}

        {mcxLiveRate != null && activeTab === 'gold' ? (
          <Text style={styles.mcxHint}>MCX Live: ₹ {mcxLiveRate.toLocaleString('en-IN')}</Text>
        ) : null}

        <View style={styles.cardsWrap}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={Colors.primaryNav} />
            </View>
          ) : activeTab === 'gold' ? (
            goldItems.map((item) => <MarketCard key={item.id} item={item} />)
          ) : activeTab === 'diamond' ? (
            diamondRates.length > 0 ? (
              diamondRates.map((rate) => (
                <StoneRateCard key={rate.id ?? `${rate.color}-${rate.clarity}`} rate={rate} />
              ))
            ) : (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No diamond rates available yet</Text>
              </View>
            )
          ) : colorstoneRates.length > 0 ? (
            colorstoneRates.map((rate) => (
              <StoneRateCard key={rate.id ?? `${rate.color}-${rate.clarity}`} rate={rate} />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No colorstone rates available yet</Text>
            </View>
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
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  pageTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  dateBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: ACCENT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  dateDay: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  dateNum: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 28,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tabScroll: {
    flex: 1,
  },
  tabPill: {
    flexDirection: 'row',
    backgroundColor: TAB_INACTIVE,
    borderRadius: 24,
    padding: 4,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: ACCENT_GOLD,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  refreshBtn: {
    marginLeft: 12,
    padding: 8,
  },
  editRatesLink: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  editRatesText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryNav,
  },
  mcxHint: {
    marginHorizontal: 20,
    marginTop: 8,
    fontSize: 12,
    color: Colors.textMuted,
  },
  cardsWrap: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});
