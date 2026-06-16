import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MarketCard } from '@/components/dashboard/MarketCard';
import { GOLD_MARKET_DATA } from '@/constants/marketData';
import { Colors } from '@/constants/theme';

const ACCENT_GOLD = '#D4C19C';
const TAB_INACTIVE = '#F2F2F7';

type MetalTab = 'gold' | 'silver';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<MetalTab>('gold');
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date();
  const dayLabel = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = today.getDate();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
          <View style={styles.tabPill}>
            <Pressable
              onPress={() => setActiveTab('gold')}
              style={[styles.tabBtn, activeTab === 'gold' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === 'gold' && styles.tabTextActive]}>
                Gold
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('silver')}
              style={[styles.tabBtn, activeTab === 'silver' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === 'silver' && styles.tabTextActive]}>
                Silver
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={handleRefresh} hitSlop={8} style={styles.refreshBtn}>
            <RefreshCw
              size={22}
              color={Colors.textPrimary}
              style={refreshing ? { opacity: 0.5 } : undefined}
            />
          </Pressable>
        </View>

        <View style={styles.cardsWrap}>
          {activeTab === 'gold' ? (
            GOLD_MARKET_DATA.map((item) => <MarketCard key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Silver market data coming soon</Text>
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
  tabPill: {
    flexDirection: 'row',
    backgroundColor: TAB_INACTIVE,
    borderRadius: 24,
    padding: 4,
  },
  tabBtn: {
    paddingHorizontal: 20,
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
    marginLeft: 'auto',
    padding: 8,
  },
  cardsWrap: {
    paddingHorizontal: 20,
    marginTop: 16,
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
