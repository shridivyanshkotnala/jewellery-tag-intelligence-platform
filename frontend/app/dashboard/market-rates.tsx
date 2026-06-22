import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronLeft, Plus, SquarePen, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useRequireMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
import type { GoldIncreaseByType, GoldRate, StoneRate } from '@/types/rates';
import { ApiError } from '@/utils/apiClient';
import { formatInr } from '@/utils/rateMappers';
import {
  fetchColorstoneRates,
  fetchDiamondRates,
  fetchGoldRates,
  updateGoldRate,
  upsertColorstoneRate,
  upsertDiamondRate,
} from '@/utils/ratesApi';

const BUTTON_GREEN = '#1B3022';
const ACCENT_GOLD = '#D4C19C';

type RatesTab = 'gold' | 'diamond' | 'colorstone';

interface GoldRowProps {
  rate: GoldRate;
  onEdit: () => void;
  showDivider: boolean;
}

function GoldRow({ rate, onEdit, showDivider }: GoldRowProps) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>{rate.carat}</Text>
          <Text style={styles.rowSubLabel}>Purity {rate.purity}%</Text>
        </View>
        <Text style={styles.rowValue}>{formatInr(rate.finalRate)}</Text>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.editBtn}>
          <SquarePen size={16} color={Colors.textPrimary} />
        </Pressable>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

interface StoneRowProps {
  rate: StoneRate;
  onEdit: () => void;
  showDivider: boolean;
}

function StoneRow({ rate, onEdit, showDivider }: StoneRowProps) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>
            {rate.color} · {rate.clarity}
          </Text>
        </View>
        <Text style={styles.rowValue}>{formatInr(rate.rate)}</Text>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.editBtn}>
          <SquarePen size={16} color={Colors.textPrimary} />
        </Pressable>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

export default function MarketRatesScreen() {
  const allowed = useRequireMarketRatesAccess();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RatesTab>('gold');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mcxLiveRate, setMcxLiveRate] = useState(0);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [diamondRates, setDiamondRates] = useState<StoneRate[]>([]);
  const [colorstoneRates, setColorstoneRates] = useState<StoneRate[]>([]);

  const [editingGold, setEditingGold] = useState<GoldRate | null>(null);
  const [goldIncreaseAmount, setGoldIncreaseAmount] = useState('');
  const [goldIncreaseType, setGoldIncreaseType] = useState<GoldIncreaseByType>('FLAT');

  const [editingStone, setEditingStone] = useState<StoneRate | null>(null);
  const [stoneColor, setStoneColor] = useState('');
  const [stoneClarity, setStoneClarity] = useState('');
  const [stoneRateValue, setStoneRateValue] = useState('');
  const [stoneModalMode, setStoneModalMode] = useState<'diamond' | 'colorstone'>('diamond');
  const [isNewStone, setIsNewStone] = useState(false);

  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      const [gold, diamond, colorstone] = await Promise.all([
        fetchGoldRates(),
        fetchDiamondRates(),
        fetchColorstoneRates(),
      ]);
      setMcxLiveRate(gold.mcxLiveRate);
      setGoldRates(gold.rates);
      setDiamondRates(diamond);
      setColorstoneRates(colorstone);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to load market rates. Please try again.';
      Alert.alert('Load Error', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (allowed) {
        void loadRates();
      }
    }, [allowed, loadRates]),
  );

  if (!allowed) return null;

  const openGoldEdit = (rate: GoldRate) => {
    setEditingGold(rate);
    setGoldIncreaseAmount(String(rate.increaseByAmount ?? 0));
    setGoldIncreaseType(rate.increaseByType ?? 'FLAT');
  };

  const openStoneEdit = (rate: StoneRate, mode: 'diamond' | 'colorstone') => {
    setStoneModalMode(mode);
    setIsNewStone(false);
    setEditingStone(rate);
    setStoneColor(rate.color);
    setStoneClarity(rate.clarity);
    setStoneRateValue(String(rate.rate));
  };

  const openStoneAdd = (mode: 'diamond' | 'colorstone') => {
    setStoneModalMode(mode);
    setIsNewStone(true);
    setEditingStone(null);
    setStoneColor('');
    setStoneClarity('');
    setStoneRateValue('');
  };

  const closeStoneModal = () => {
    setEditingStone(null);
    setIsNewStone(false);
  };

  const handleSaveGold = async () => {
    if (!editingGold) return;
    const increaseByAmount = Number(goldIncreaseAmount);
    if (!Number.isFinite(increaseByAmount)) {
      Alert.alert('Invalid Input', 'Please enter a valid increase amount.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateGoldRate({
        carat: editingGold.carat,
        purity: editingGold.purity,
        increaseByAmount,
        increaseByType: goldIncreaseType,
      });
      setGoldRates((prev) => prev.map((row) => (row.carat === updated.carat ? updated : row)));
      setEditingGold(null);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update gold rate. Please try again.';
      Alert.alert('Update Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStone = async () => {
    const color = stoneColor.trim();
    const clarity = stoneClarity.trim();
    const rate = Number(stoneRateValue);

    if (!color || !clarity) {
      Alert.alert('Invalid Input', 'Color and clarity are required.');
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid rate.');
      return;
    }

    setSaving(true);
    try {
      const payload = { color, clarity, rate };
      const updated =
        stoneModalMode === 'diamond'
          ? await upsertDiamondRate(payload)
          : await upsertColorstoneRate(payload);

      if (stoneModalMode === 'diamond') {
        setDiamondRates((prev) => {
          const index = prev.findIndex(
            (item) => item.color === updated.color && item.clarity === updated.clarity,
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = updated;
            return next;
          }
          return [...prev, updated];
        });
      } else {
        setColorstoneRates((prev) => {
          const index = prev.findIndex(
            (item) => item.color === updated.color && item.clarity === updated.clarity,
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = updated;
            return next;
          }
          return [...prev, updated];
        });
      }
      closeStoneModal();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to save rate. Please try again.';
      Alert.alert('Save Error', message);
    } finally {
      setSaving(false);
    }
  };

  const activeStoneRates = stoneModalMode === 'diamond' ? diamondRates : colorstoneRates;
  const stoneTitle = activeTab === 'diamond' ? 'Diamond' : 'Colorstone';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>
            Market Rates{'\n'}Control
          </Text>
        </View>

        <View style={styles.tabPill}>
          {(['gold', 'diamond', 'colorstone'] as RatesTab[]).map((tab) => (
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

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BUTTON_GREEN} />
          </View>
        ) : activeTab === 'gold' ? (
          <>
            <View style={styles.mcxBanner}>
              <Text style={styles.mcxLabel}>MCX Live Rate</Text>
              <Text style={styles.mcxValue}>{formatInr(mcxLiveRate)}</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Gold Karat Rates</Text>
              </View>
              {goldRates.length === 0 ? (
                <Text style={styles.emptyText}>No gold rates found. Pull to refresh from API.</Text>
              ) : (
                goldRates.map((rate, index) => (
                  <GoldRow
                    key={rate.id ?? rate.carat}
                    rate={rate}
                    onEdit={() => openGoldEdit(rate)}
                    showDivider={index < goldRates.length - 1}
                  />
                ))
              )}
            </View>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => openStoneAdd(activeTab)}
              style={styles.addBtn}
            >
              <Plus size={18} color={Colors.white} />
              <Text style={styles.addBtnText}>Add {stoneTitle} Rate</Text>
            </Pressable>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>{stoneTitle} Rates</Text>
              </View>
              {activeStoneRates.length === 0 ? (
                <Text style={styles.emptyText}>No {stoneTitle.toLowerCase()} rates yet.</Text>
              ) : (
                (activeTab === 'diamond' ? diamondRates : colorstoneRates).map((rate, index, list) => (
                  <StoneRow
                    key={rate.id ?? `${rate.color}-${rate.clarity}`}
                    rate={rate}
                    onEdit={() => openStoneEdit(rate, activeTab)}
                    showDivider={index < list.length - 1}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav activeRoute="home" />

      <Modal
        visible={editingGold !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingGold(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Pressable onPress={() => setEditingGold(null)} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>Update {editingGold?.carat} Gold Rate</Text>
            <Text style={styles.modalMeta}>
              Purity: {editingGold?.purity}% · Current: {formatInr(editingGold?.finalRate ?? 0)}
            </Text>
            <Text style={styles.modalLabel}>Increase By Amount</Text>
            <TextInput
              value={goldIncreaseAmount}
              onChangeText={setGoldIncreaseAmount}
              keyboardType="decimal-pad"
              placeholder="50"
              placeholderTextColor={Colors.placeholder}
              style={styles.modalInput}
            />
            <Text style={styles.modalLabel}>Increase Type</Text>
            <View style={styles.typeRow}>
              {(['FLAT', 'PERCENTAGE'] as GoldIncreaseByType[]).map((type) => {
                const active = goldIncreaseType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setGoldIncreaseType(type)}
                    style={[styles.typeBtn, active && styles.typeBtnActive]}
                  >
                    <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSaveGold}
              disabled={saving}
              style={[styles.modalSaveBtn, saving && styles.modalSaveBtnDisabled]}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.modalSaveText}>Save Gold Rate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editingStone !== null || isNewStone}
        transparent
        animationType="fade"
        onRequestClose={closeStoneModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Pressable onPress={closeStoneModal} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              {isNewStone ? 'Add' : 'Update'} {stoneModalMode === 'diamond' ? 'Diamond' : 'Colorstone'} Rate
            </Text>
            <Text style={styles.modalLabel}>Color</Text>
            <TextInput
              value={stoneColor}
              onChangeText={setStoneColor}
              placeholder={stoneModalMode === 'diamond' ? 'D' : 'Ruby Red'}
              placeholderTextColor={Colors.placeholder}
              style={styles.modalInput}
            />
            <Text style={styles.modalLabel}>Clarity</Text>
            <TextInput
              value={stoneClarity}
              onChangeText={setStoneClarity}
              placeholder={stoneModalMode === 'diamond' ? 'VVS1' : 'A1'}
              placeholderTextColor={Colors.placeholder}
              style={styles.modalInput}
            />
            <Text style={styles.modalLabel}>Rate</Text>
            <TextInput
              value={stoneRateValue}
              onChangeText={setStoneRateValue}
              keyboardType="decimal-pad"
              placeholder="120000"
              placeholderTextColor={Colors.placeholder}
              style={styles.modalInput}
            />
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSaveStone}
              disabled={saving}
              style={[styles.modalSaveBtn, saving && styles.modalSaveBtnDisabled]}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.modalSaveText}>Save Rate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  tabPill: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: ACCENT_GOLD,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  mcxBanner: {
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 16,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.input,
    padding: 16,
  },
  mcxLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  mcxValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  card: {
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowSubLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  editBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  emptyText: {
    padding: 16,
    fontSize: 14,
    color: Colors.textMuted,
  },
  addBtn: {
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 12,
    height: 44,
    borderRadius: Radius.button,
    backgroundColor: BUTTON_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    padding: 20,
  },
  modalClose: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 8,
  },
  modalInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingVertical: 10,
  },
  typeBtnActive: {
    borderColor: BUTTON_GREEN,
    backgroundColor: '#E8F0EC',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: BUTTON_GREEN,
  },
  modalSaveBtn: {
    height: 48,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalSaveBtnDisabled: {
    opacity: 0.7,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});
