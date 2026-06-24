import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';

import { DeleteStoneRateModal } from '@/components/dashboard/market-rates/DeleteStoneRateModal';
import { StoneRateFormModal } from '@/components/dashboard/market-rates/StoneRateFormModal';
import type { ToastType } from '@/components/scanner/ToastNotification';
import {
  deleteColorstoneRate,
  deleteDiamondRate,
  fetchColorstoneRates,
  fetchDiamondRates,
  upsertColorstoneRate,
  upsertDiamondRate,
} from '@/utils/ratesApi';
import type { StoneRateKind } from '@/constants/stoneRateOptions';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { StoneRate } from '@/types/rates';
import {
  createLocalStoneRateId,
  displayStoneField,
  findDuplicateStoneRate,
  formatStoneRatePerCt,
  stoneRateSummary,
  validateStoneRateForm,
} from '@/utils/stoneRateUtils';

const DELETE_RED = '#EA4335';
const BUTTON_GREEN = '#1B3022';

interface StoneRatesTableProps {
  title: string;
  rates: StoneRate[];
  onEdit: (rate: StoneRate) => void;
  onDelete: (rate: StoneRate) => void;
  onAdd: () => void;
}

function StoneRatesTable({ title, rates, onEdit, onDelete, onAdd }: StoneRatesTableProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 480;

  return (
    <View>
      <Pressable onPress={onAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add {title} Rate</Text>
      </Pressable>

      {rates.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No {title.toLowerCase()} rates yet</Text>
          <Text style={styles.emptyText}>
            Tap Add {title} Rate to configure color, clarity, or combined rates per carat.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal={isCompact} showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, isCompact && styles.tableCompact]}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.colorCol]}>Color</Text>
              <Text style={[styles.headerCell, styles.clarityCol]}>Clarity</Text>
              <Text style={[styles.headerCell, styles.rateCol]}>Rate/ct</Text>
              <Text style={[styles.headerCell, styles.actionsCol]}>Actions</Text>
            </View>
            {rates.map((rate, index) => (
              <View
                key={rate.id}
                style={[styles.dataRow, index < rates.length - 1 && styles.rowBorder]}
              >
                <Text style={[styles.cell, styles.colorCol]}>{displayStoneField(rate.color)}</Text>
                <Text style={[styles.cell, styles.clarityCol]}>
                  {displayStoneField(rate.clarity)}
                </Text>
                <Text style={[styles.cell, styles.rateCol, styles.rateText]}>
                  {formatStoneRatePerCt(rate.rate)}
                </Text>
                <View style={[styles.actionsCol, styles.actionsWrap]}>
                  <Pressable onPress={() => onEdit(rate)} style={styles.editBtn}>
                    <Pencil size={12} color={Colors.white} />
                    <Text style={styles.editText}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => onDelete(rate)} style={styles.deleteBtn}>
                    <Trash2 size={12} color={DELETE_RED} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

interface StoneRatesPanelProps {
  stoneType: StoneRateKind;
  onToast?: (message: string, type?: ToastType) => void;
}

export function StoneRatesPanel({ stoneType, onToast }: StoneRatesPanelProps) {
  const title = stoneType === 'diamond' ? 'Diamond' : 'Colorstone';
  const [rates, setRates] = useState<StoneRate[]>([]);
  const [editingRate, setEditingRate] = useState<StoneRate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [color, setColor] = useState('');
  const [clarity, setClarity] = useState('');
  const [rateValue, setRateValue] = useState('');
  const [formErrors, setFormErrors] = useState<{
    color?: string;
    clarity?: string;
    rate?: string;
  }>({});
  const [deletingRate, setDeletingRate] = useState<StoneRate | null>(null);
  const [saving, setSaving] = useState(false);

  const notify = (message: string, type: ToastType = 'info') => {
    onToast?.(message, type);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data =
          stoneType === 'diamond' ? await fetchDiamondRates() : await fetchColorstoneRates();
        if (active) setRates(data);
      } catch (err) {
        if (active) notify('Failed to load rates', 'error');
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [stoneType]);

  const openAdd = () => {
    setIsNew(true);
    setEditingRate(null);
    setColor('');
    setClarity('');
    setRateValue('');
    setFormErrors({});
  };

  const openEdit = (rate: StoneRate) => {
    setIsNew(false);
    setEditingRate(rate);
    setColor(rate.color);
    setClarity(rate.clarity);
    setRateValue(String(rate.rate));
    setFormErrors({});
  };

  const closeForm = () => {
    setIsNew(false);
    setEditingRate(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    const errors = validateStoneRateForm(color, clarity, rateValue);
    if (errors) {
      setFormErrors(errors);
      return;
    }

    const trimmedColor = color.trim();
    const trimmedClarity = clarity.trim();
    const rate = Number(rateValue);

    if (findDuplicateStoneRate(rates, trimmedColor, trimmedClarity, editingRate?.id)) {
      notify('A rate with the same color and clarity already exists.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { color: trimmedColor, clarity: trimmedClarity, rate };
      const savedRate =
        stoneType === 'diamond'
          ? await upsertDiamondRate(payload)
          : await upsertColorstoneRate(payload);

      setRates((prev) => {
        if (editingRate) {
          return prev.map((item) => (item.id === editingRate.id ? savedRate : item));
        }
        return [...prev, savedRate];
      });

      closeForm();
      notify(`${title} rate ${editingRate ? 'updated' : 'added'}`, 'success');
    } catch (err) {
      notify(`Failed to save ${title.toLowerCase()} rate`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRate) return;
    setSaving(true);
    try {
      if (stoneType === 'diamond') {
        await deleteDiamondRate(deletingRate.id);
      } else {
        await deleteColorstoneRate(deletingRate.id);
      }
      setRates((prev) => prev.filter((item) => item.id !== deletingRate.id));
      notify(`${title} rate deleted`, 'success');
      setDeletingRate(null);
    } catch (err) {
      notify(`Failed to delete ${title.toLowerCase()} rate`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <StoneRatesTable
        title={title}
        rates={rates}
        onEdit={openEdit}
        onDelete={setDeletingRate}
        onAdd={openAdd}
      />

      <StoneRateFormModal
        visible={isNew || editingRate !== null}
        mode={stoneType}
        isNew={isNew}
        color={color}
        clarity={clarity}
        rateValue={rateValue}
        errors={formErrors}
        saving={saving}
        onColorChange={(value) => {
          setColor(value);
          if (formErrors.color || formErrors.clarity) {
            setFormErrors((prev) => ({ ...prev, color: undefined, clarity: undefined }));
          }
        }}
        onClarityChange={(value) => {
          setClarity(value);
          if (formErrors.color || formErrors.clarity) {
            setFormErrors((prev) => ({ ...prev, color: undefined, clarity: undefined }));
          }
        }}
        onRateChange={(value) => {
          setRateValue(value.replace(/[^\d.]/g, ''));
          if (formErrors.rate) {
            setFormErrors((prev) => ({ ...prev, rate: undefined }));
          }
        }}
        onClose={closeForm}
        onSave={handleSave}
      />

      <DeleteStoneRateModal
        visible={deletingRate !== null}
        title={`Delete ${title} Rate?`}
        subtitle={
          deletingRate
            ? `This will permanently remove ${stoneRateSummary(deletingRate)}.`
            : ''
        }
        onClose={() => setDeletingRate(null)}
        onConfirm={handleConfirmDelete}
        confirming={saving}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    height: Spacing.buttonHeight,
    borderRadius: Radius.button,
    backgroundColor: BUTTON_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  addBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  emptyCard: {
    ...screenStyles.emptyCard,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  table: {
    width: '100%',
    ...screenStyles.table,
  },
  tableCompact: { minWidth: 520 },
  headerRow: screenStyles.tableHeaderRow,
  headerCell: screenStyles.tableHeaderCell,
  dataRow: screenStyles.tableDataRow,
  rowBorder: screenStyles.tableRowBorder,
  cell: screenStyles.tableCell,
  colorCol: { width: 72, flexShrink: 0 },
  clarityCol: { width: 72, flexShrink: 0 },
  rateCol: { width: 120, flexShrink: 0 },
  actionsCol: { flex: 1, minWidth: 150 },
  rateText: { fontWeight: '600' },
  actionsWrap: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BUTTON_GREEN,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#F5C6C2',
    backgroundColor: '#FCE8E6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deleteText: { color: DELETE_RED, fontSize: 11, fontWeight: '600' },
});
