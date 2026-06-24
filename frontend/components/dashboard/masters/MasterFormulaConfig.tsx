import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFormulaStore } from '@/store/formulaStore';
import type { ActiveFormula } from '@/store/formulaStore';
import {
  ALL_FORMULA_KARATS,
  getKaratOptionsForAdd,
  getKaratOptionsForEdit,
} from '@/utils/formulaUtils';

const BUTTON_GREEN = '#1B3022';

const FORMULA_OPTIONS: { value: ActiveFormula; label: string; description: string }[] = [
  {
    value: 'F1',
    label: 'Formula 1',
    description: 'Standard scanner calculation — all scanned karat values accepted.',
  },
  {
    value: 'F2',
    label: 'Formula 2',
    description: 'Whitelist karat values — scanner review restricts to configured karats only.',
  },
];

interface KaratRuleRowProps {
  karat: string;
  index: number;
  totalRows: number;
  onUpdate: (karat: string) => void;
  onDelete: () => void;
}

function KaratRuleRow({ karat, index, totalRows, onUpdate, onDelete }: KaratRuleRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const formula2Rules = useFormulaStore((s) => s.formula2Rules);
  const editOptions = getKaratOptionsForEdit(formula2Rules, index);
  const showDelete = totalRows > 1;

  return (
    <View style={styles.ruleRow}>
      <View style={styles.ruleKaratBadge}>
        <Text style={styles.ruleKaratText}>{karat}</Text>
      </View>
      <View style={styles.ruleActions}>
        <Pressable onPress={() => setEditOpen((prev) => !prev)} style={styles.editBtn}>
          <Pencil size={14} color={Colors.white} />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
        {showDelete ? (
          <Pressable onPress={onDelete} style={styles.deleteBtn}>
            <Trash2 size={14} color="#D93025" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        ) : null}
      </View>
      {editOpen ? (
        <View style={styles.dropdown}>
          {editOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onUpdate(option);
                setEditOpen(false);
              }}
              style={[styles.dropdownItem, option === karat && styles.dropdownItemActive]}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  option === karat && styles.dropdownItemTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

interface NewKaratRowProps {
  options: string[];
  onSelect: (karat: string) => void;
  onCancel: () => void;
}

function NewKaratRow({ options, onSelect, onCancel }: NewKaratRowProps) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(options[0] ?? '');

  if (options.length === 0) return null;

  return (
    <View style={styles.ruleRow}>
      <Text style={styles.newRowLabel}>Select Karat</Text>
      <Pressable onPress={() => setOpen((prev) => !prev)} style={styles.newDropdown}>
        <Text style={styles.newDropdownText}>{selected || 'Choose karat'}</Text>
        <ChevronDown size={18} color={Colors.textMuted} />
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setSelected(option);
                setOpen(false);
              }}
              style={[styles.dropdownItem, option === selected && styles.dropdownItemActive]}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  option === selected && styles.dropdownItemTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.newRowActions}>
        <Pressable onPress={onCancel} style={styles.cancelSmallBtn}>
          <Text style={styles.cancelSmallBtnText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => selected && onSelect(selected)}
          disabled={!selected}
          style={[styles.applySmallBtn, !selected && styles.applySmallBtnDisabled]}
        >
          <Text style={styles.applySmallBtnText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function MasterFormulaConfig() {
  const activeFormula = useFormulaStore((s) => s.activeFormula);
  const formula2Rules = useFormulaStore((s) => s.formula2Rules);
  const setActiveFormula = useFormulaStore((s) => s.setActiveFormula);
  const updateFormula2Rule = useFormulaStore((s) => s.updateFormula2Rule);
  const addFormula2Rule = useFormulaStore((s) => s.addFormula2Rule);
  const removeFormula2Rule = useFormulaStore((s) => s.removeFormula2Rule);

  const [addingField, setAddingField] = useState(false);
  const addOptions = getKaratOptionsForAdd(formula2Rules);
  const canAddMore = addOptions.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Active Formula</Text>
      <View style={styles.formulaToggleRow}>
        {FORMULA_OPTIONS.map((option) => {
          const isActive = activeFormula === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setActiveFormula(option.value)}
              style={[styles.formulaCard, isActive && styles.formulaCardActive]}
            >
              <Text style={[styles.formulaCardLabel, isActive && styles.formulaCardLabelActive]}>
                {option.label}
              </Text>
              <Text style={styles.formulaCardDesc}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeFormula === 'F2' ? (
        <View style={styles.f2Section}>
          <Text style={styles.sectionTitle}>Formula 2 Karat Whitelist</Text>
          <Text style={styles.sectionHint}>
            Only karats listed below will be accepted on the scanner review screen. All other scanned
            karat values will require manual selection from this list.
          </Text>

          {formula2Rules.map((karat, index) => (
            <KaratRuleRow
              key={`${karat}-${index}`}
              karat={karat}
              index={index}
              totalRows={formula2Rules.length}
              onUpdate={(value) => updateFormula2Rule(index, value)}
              onDelete={() => removeFormula2Rule(index)}
            />
          ))}

          {addingField ? (
            <NewKaratRow
              options={addOptions}
              onSelect={(karat) => {
                addFormula2Rule(karat);
                setAddingField(false);
              }}
              onCancel={() => setAddingField(false)}
            />
          ) : (
            <Pressable
              onPress={() => canAddMore && setAddingField(true)}
              disabled={!canAddMore}
              style={[styles.addFieldsBtn, !canAddMore && styles.addFieldsBtnDisabled]}
            >
              <Plus size={16} color={canAddMore ? BUTTON_GREEN : Colors.textMuted} />
              <Text style={[styles.addFieldsText, !canAddMore && styles.addFieldsTextDisabled]}>
                + Add Fields
              </Text>
            </Pressable>
          )}

          <Text style={styles.availableHint}>
            Available karats: {ALL_FORMULA_KARATS.join(', ')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  sectionHint: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  formulaToggleRow: { gap: Spacing.md },
  formulaCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    gap: 6,
  },
  formulaCardActive: { borderColor: BUTTON_GREEN, backgroundColor: '#E8F0EC' },
  formulaCardLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  formulaCardLabelActive: { color: BUTTON_GREEN },
  formulaCardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  f2Section: { gap: Spacing.md },
  ruleRow: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  ruleKaratBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F7F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ruleKaratText: { fontSize: 16, fontWeight: '700', color: BUTTON_GREEN },
  ruleActions: { flexDirection: 'row', gap: Spacing.sm },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BUTTON_GREEN,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F5C6C2',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF5F5',
  },
  deleteBtnText: { color: '#D93025', fontSize: 12, fontWeight: '600' },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  dropdownItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  dropdownItemActive: { backgroundColor: '#E8F0EC' },
  dropdownItemText: { fontSize: 14, color: Colors.textPrimary },
  dropdownItemTextActive: { fontWeight: '700', color: BUTTON_GREEN },
  addFieldsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BUTTON_GREEN,
    borderRadius: Radius.input,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  addFieldsBtnDisabled: { borderColor: Colors.border },
  addFieldsText: { fontSize: 14, fontWeight: '600', color: BUTTON_GREEN },
  addFieldsTextDisabled: { color: Colors.textMuted },
  availableHint: { fontSize: 12, color: Colors.textMuted },
  newRowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  newDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  newDropdownText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  newRowActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  cancelSmallBtn: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.button,
    paddingVertical: 10,
  },
  cancelSmallBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  applySmallBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    paddingVertical: 10,
  },
  applySmallBtnDisabled: { opacity: 0.5 },
  applySmallBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },
});
