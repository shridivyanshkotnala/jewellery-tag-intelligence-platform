import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GoldTaxChangeEditModal,
  GoldTaxSettingsModal,
  GoldTaxSettingsRow,
  ScannerCalculationPicker,
  type ScannerCalculationUse,
  type TaxChangeTarget,
} from '@/components/dashboard/market-rates/GoldTaxSettings';
import {
  GoldEditModalFields,
  GoldIncreaseModalFields,
  GoldRatesTable,
  McxLiveBanner,
} from '@/components/dashboard/market-rates/GoldRatesTable';
import { StoneRatesPanel } from '@/components/dashboard/market-rates/StoneRatesPanel';
import { LabourRatesPanel } from '@/components/dashboard/market-rates/LabourRatesPanel';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { ToastNotification, type ToastType } from '@/components/scanner/ToastNotification';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { PageHeader } from '@/components/ui/PageHeader';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useRequireMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
import type { GoldIncreaseByType, GoldRate } from '@/types/rates';
import { ApiError } from '@/utils/apiClient';
import {
  applyGoldIncrease,
  calculateBaseGoldRate,
  computeDisplayGoldRates,
  deriveActiveBaseRate,
  flatIncreaseForFinalRate,
  formatKaratLabel,
  validateFinalRateValue,
  validateIncreaseAmount,
  validatePurityValue,
} from '@/utils/goldRateUtils';
import {
  fetchGoldRates,
  updateGoldRate,
} from '@/utils/ratesApi';

const BUTTON_GREEN = '#1B3022';
const CARAT_ORDER = ['22Kt', '20Kt', '18Kt', '14Kt', '9Kt'];

type RatesTab = 'gold' | 'diamond' | 'colorstone' | 'labour';

const TAB_BREADCRUMB: Record<RatesTab, string> = {
  gold: 'Settings → Masters → Rates → Gold',
  diamond: 'Settings → Masters → Rates → Diamond',
  colorstone: 'Settings → Masters → Rates → Colorstone',
  labour: 'Settings → Masters → Rates → Labour Charges',
};

const TAB_SCREEN_TITLE: Record<RatesTab, string> = {
  gold: 'Gold Rates',
  diamond: 'Diamond Rates',
  colorstone: 'Colorstone Rates',
  labour: 'Labour Charge Rates',
};

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

function parseTabParam(tab?: string): RatesTab {
  if (tab === 'diamond' || tab === 'colorstone' || tab === 'labour' || tab === 'gold') {
    return tab;
  }
  return 'gold';
}

export default function MarketRatesScreen() {
  const allowed = useRequireMarketRatesAccess();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const activeTab = useMemo(() => parseTabParam(tab), [tab]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mcxLiveRate, setMcxLiveRate] = useState(0);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const [editingGold, setEditingGold] = useState<GoldRate | null>(null);
  const [editPurity, setEditPurity] = useState('');
  const [editFinalRate, setEditFinalRate] = useState('');
  const [editPurityError, setEditPurityError] = useState<string | null>(null);
  const [editFinalRateError, setEditFinalRateError] = useState<string | null>(null);

  const [increasingGold, setIncreasingGold] = useState<GoldRate | null>(null);
  const [increaseAmount, setIncreaseAmount] = useState('');
  const [increaseType, setIncreaseType] = useState<GoldIncreaseByType>('PERCENTAGE');
  const [increaseError, setIncreaseError] = useState<string | null>(null);

  const [rtgsChange, setRtgsChange] = useState(0);
  const [cashChange, setCashChange] = useState(0);
  const [scannerCalculationUse, setScannerCalculationUse] = useState<ScannerCalculationUse>('rtgs');
  const [taxSettingsVisible, setTaxSettingsVisible] = useState(false);
  const [editingTaxTarget, setEditingTaxTarget] = useState<TaxChangeTarget | null>(null);

  const sortedGoldRates = useMemo(() => sortGoldRates(goldRates), [goldRates]);

  const rtgsFinalRate = mcxLiveRate + rtgsChange;
  const cashFinalRate = mcxLiveRate + cashChange;

  const activeBaseRate = useMemo(
    () => deriveActiveBaseRate(scannerCalculationUse, mcxLiveRate, rtgsFinalRate, cashFinalRate),
    [scannerCalculationUse, mcxLiveRate, rtgsFinalRate, cashFinalRate],
  );

  const displayGoldRates = useMemo(
    () => computeDisplayGoldRates(sortedGoldRates, activeBaseRate),
    [sortedGoldRates, activeBaseRate],
  );

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const loadRates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const gold = await fetchGoldRates();
      setMcxLiveRate(gold.mcxLiveRate);
      setGoldRates(gold.rates);
      if (isRefresh) showToast('Rates refreshed successfully', 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to load market rates. Please try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (allowed && activeTab === 'gold') void loadRates();
    }, [allowed, activeTab, loadRates]),
  );

  if (!allowed) return null;

  const openGoldEdit = (rate: GoldRate) => {
    setEditingGold(rate);
    setEditPurity(String(rate.purity));
    setEditFinalRate(String(rate.finalRate));
    setEditPurityError(null);
    setEditFinalRateError(null);
  };

  const openGoldIncrease = (rate: GoldRate) => {
    setIncreasingGold(rate);
    setIncreaseAmount('');
    setIncreaseType('PERCENTAGE');
    setIncreaseError(null);
  };

  const handleEditPurityChange = (value: string) => {
    setEditPurity(value);
    const purity = Number(value);
    const purityErr = validatePurityValue(purity);
    setEditPurityError(purityErr);
    if (!purityErr && activeBaseRate > 0) {
      const recalculated = calculateBaseGoldRate(activeBaseRate, purity);
      setEditFinalRate(String(recalculated));
      setEditFinalRateError(null);
    }
  };

  const handleEditFinalRateChange = (value: string) => {
    setEditFinalRate(value.replace(/[^\d.]/g, ''));
    const finalRate = Number(value);
    setEditFinalRateError(validateFinalRateValue(finalRate));
  };

  const handleSaveGoldEdit = async () => {
    if (!editingGold) return;
    const purity = Number(editPurity);
    const finalRate = Number(editFinalRate);
    const purityErr = validatePurityValue(purity);
    const finalRateErr = validateFinalRateValue(finalRate);
    setEditPurityError(purityErr);
    setEditFinalRateError(finalRateErr);
    if (purityErr || finalRateErr) return;

    const baseRate = calculateBaseGoldRate(activeBaseRate, purity);
    const increaseByAmount = flatIncreaseForFinalRate(baseRate, finalRate);
    const increaseByType: GoldIncreaseByType = 'FLAT';

    setSaving(true);
    try {
      const updated = await updateGoldRate({
        carat: editingGold.carat,
        purity,
        increaseByAmount,
        increaseByType,
      });
      setGoldRates((prev) =>
        prev.map((row) => (row.carat === updated.carat ? updated : row)),
      );
      setEditingGold(null);
      showToast(`${formatKaratLabel(updated.carat)} rate updated`, 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update gold rate. Please try again.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyIncrease = async () => {
    if (!increasingGold) return;
    const amount = Number(increaseAmount);
    const amountErr = validateIncreaseAmount(amount);
    setIncreaseError(amountErr);
    if (amountErr) return;

    setSaving(true);
    try {
      const updated = await updateGoldRate({
        carat: increasingGold.carat,
        purity: increasingGold.purity,
        increaseByAmount: amount,
        increaseByType: increaseType,
      });
      setGoldRates((prev) =>
        prev.map((row) => (row.carat === updated.carat ? updated : row)),
      );
      setIncreasingGold(null);
      showToast(`${formatKaratLabel(updated.carat)} rate increased`, 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to apply increase. Please try again.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const increasePreview =
    increasingGold && increaseAmount
      ? applyGoldIncrease(
          calculateBaseGoldRate(activeBaseRate, increasingGold.purity),
          Number(increaseAmount) || 0,
          increaseType,
        )
      : null;

  const openTaxChangeEdit = (target: TaxChangeTarget) => {
    setEditingTaxTarget(target);
  };

  const handleApplyTaxChange = (change: number) => {
    if (editingTaxTarget === 'rtgs') {
      setRtgsChange(change);
    } else if (editingTaxTarget === 'cash') {
      setCashChange(change);
    }
    setEditingTaxTarget(null);
  };

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === 'gold' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadRates(true)}
              tintColor={BUTTON_GREEN}
            />
          ) : undefined
        }
      >
        <PageHeader
          title={TAB_SCREEN_TITLE[activeTab]}
          subtitle={TAB_BREADCRUMB[activeTab]}
        />

        {loading && activeTab === 'gold' ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BUTTON_GREEN} />
            <Text style={styles.loadingText}>Loading rates…</Text>
          </View>
        ) : activeTab === 'gold' ? (
          <View style={screenStyles.screenSection}>
            <McxLiveBanner mcxLiveRate={mcxLiveRate} />
            <GoldTaxSettingsRow onPress={() => setTaxSettingsVisible(true)} />
            <ScannerCalculationPicker
              value={scannerCalculationUse}
              onChange={setScannerCalculationUse}
            />
            <Text style={styles.sectionTitle}>Gold Karat Rates</Text>
            {displayGoldRates.length > 0 ? (
              <GoldRatesTable
                rates={displayGoldRates}
                onEdit={openGoldEdit}
                onIncreaseBy={openGoldIncrease}
              />
            ) : (
              <View style={screenStyles.emptyCard}>
                <Text style={screenStyles.emptyText}>
                  Unable to load gold rates. Pull down to refresh.
                </Text>
              </View>
            )}
          </View>
        ) : activeTab === 'labour' ? (
          <View style={screenStyles.screenSection}>
            <LabourRatesPanel onToast={showToast} />
          </View>
        ) : activeTab === 'diamond' || activeTab === 'colorstone' ? (
          <View style={screenStyles.screenSection}>
            <StoneRatesPanel stoneType={activeTab} onToast={showToast} />
          </View>
        ) : null}
      </ScrollView>

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <BottomNav activeRoute="home" />

      <Modal
        visible={editingGold !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingGold(null)}
      >
        <View style={screenStyles.modalOverlay}>
          <View style={screenStyles.modalCard}>
            <Pressable onPress={() => setEditingGold(null)} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              Edit {editingGold ? formatKaratLabel(editingGold.carat) : ''} Rate
            </Text>
            <GoldEditModalFields
              karatLabel={editingGold ? formatKaratLabel(editingGold.carat) : ''}
              purity={editPurity}
              finalRate={editFinalRate}
              purityError={editPurityError}
              finalRateError={editFinalRateError}
              onPurityChange={handleEditPurityChange}
              onFinalRateChange={handleEditFinalRateChange}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditingGold(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSaveGoldEdit}
                disabled={saving}
                style={[styles.applyBtn, saving && styles.applyBtnDisabled]}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={increasingGold !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIncreasingGold(null)}
      >
        <View style={screenStyles.modalOverlay}>
          <View style={screenStyles.modalCard}>
            <Pressable onPress={() => setIncreasingGold(null)} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              Increase {increasingGold ? formatKaratLabel(increasingGold.carat) : ''} Rate
            </Text>
            <GoldIncreaseModalFields
              currentFinalRate={
                increasingGold
                  ? computeDisplayGoldRates([increasingGold], activeBaseRate)[0]?.finalRate ?? 0
                  : 0
              }
              increaseAmount={increaseAmount}
              increaseType={increaseType}
              increaseError={increaseError}
              onIncreaseAmountChange={setIncreaseAmount}
              onIncreaseTypeChange={setIncreaseType}
            />
            {increasePreview != null ? (
              <Text style={styles.previewText}>
                New rate after apply: ₹{increasePreview.toLocaleString('en-IN')}
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIncreasingGold(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleApplyIncrease}
                disabled={saving}
                style={[styles.applyBtn, saving && styles.applyBtnDisabled]}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <GoldTaxSettingsModal
        visible={taxSettingsVisible}
        mcxLiveRate={mcxLiveRate}
        rtgsChange={rtgsChange}
        cashChange={cashChange}
        rtgsFinalRate={rtgsFinalRate}
        cashFinalRate={cashFinalRate}
        onClose={() => setTaxSettingsVisible(false)}
        onEditRtgs={() => openTaxChangeEdit('rtgs')}
        onEditCash={() => openTaxChangeEdit('cash')}
      />

      <GoldTaxChangeEditModal
        visible={editingTaxTarget !== null}
        target={editingTaxTarget}
        currentChange={editingTaxTarget === 'cash' ? cashChange : rtgsChange}
        onClose={() => setEditingTaxTarget(null)}
        onApply={handleApplyTaxChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { paddingVertical: 48, alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: 14, color: Colors.textMuted },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  modalClose: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  previewText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  applyBtn: {
    flex: 1,
    height: Spacing.buttonHeight,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: { opacity: 0.7 },
  applyBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
