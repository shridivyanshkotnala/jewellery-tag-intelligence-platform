import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { EmployeeScreenHeader } from '@/components/employees/EmployeeScreenHeader';
import { MatrixCheckboxRow } from '@/components/settings/MatrixCheckboxRow';
import { SILVER_MATRIX_SECTION, WEIGHT_ACCESS_ROWS } from '@/constants/dashboardMatrices';
import { SETTINGS_PERMISSION_ROWS } from '@/constants/settingsPermissions';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useEmployeeDraftStore } from '@/store/employeeDraftStore';
import { useEmployeeStore } from '@/store/employeeStore';
import type { EmployeePermissionKey, ExtraPermissionKey } from '@/types/employee';
import { buildEmployeeDraftPayload, createEmployeeDraft } from '@/utils/employeeApi';

const BUTTON_GREEN = '#1B3022';

interface PermissionCardProps {
  title: string;
  subtitle: string;
  rows: { key: EmployeePermissionKey; label: string }[];
  permissions: Record<EmployeePermissionKey, boolean>;
  onToggle: (key: EmployeePermissionKey) => void;
}

function PermissionCard({ title, subtitle, rows, permissions, onToggle }: PermissionCardProps) {
  return (
    <View style={styles.permissionCard}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionSubtitle}>{subtitle}</Text>
      {rows.map((row, index) => (
        <MatrixCheckboxRow
          key={row.key}
          label={row.label}
          checked={permissions[row.key]}
          onToggle={() => onToggle(row.key)}
          showDivider={index < rows.length - 1}
        />
      ))}
    </View>
  );
}

const EXTRA_SECTIONS: {
  title: string;
  subtitle: string;
  rows: { key: ExtraPermissionKey; label: string }[];
}[] = [
  {
    title: 'Inventory Control',
    subtitle: 'Stock management access',
    rows: [
      { key: 'upload_new_items', label: 'Upload New Items' },
      { key: 'delete_stock_items', label: 'Delete Stock Items' },
    ],
  },
  {
    title: 'Formulae Edit Access',
    subtitle: 'Edit Formulae',
    rows: [{ key: 'edit_formulae', label: 'Edit Formulae' }],
  },
  {
    title: 'Account Status',
    subtitle: 'Manage login privileges',
    rows: [{ key: 'revoke_access', label: 'Temporarily Revoke Access' }],
  },
];

export default function EmployeePermissionsExtraScreen() {
  const router = useRouter();
  const draft = useEmployeeDraftStore((s) => s.draft);
  const permissions = useEmployeeDraftStore((s) => s.draft.permissions);
  const togglePermission = useEmployeeDraftStore((s) => s.togglePermission);
  const mode = useEmployeeDraftStore((s) => s.mode);
  const editEmployeeId = useEmployeeDraftStore((s) => s.editEmployeeId);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleContinue = async () => {
    setFormError(null);

    if (mode === 'edit' && editEmployeeId) {
      updateEmployee(editEmployeeId, { permissions: { ...permissions } });
      router.replace(`/dashboard/employees/${editEmployeeId}` as Href);
      return;
    }

    setSaving(true);
    try {
      const result = await createEmployeeDraft(buildEmployeeDraftPayload(draft));
      if (!result.success) {
        setFormError(result.error ?? 'Failed to save employee draft.');
        return;
      }
      router.push('/dashboard/employees/create-password' as Href);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EmployeeScreenHeader title="Set Permissions" multiline={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{SILVER_MATRIX_SECTION.sectionLabel}</Text>
          </View>
          {SILVER_MATRIX_SECTION.rows.map((row, index) => (
            <MatrixCheckboxRow
              key={row.key}
              label={row.label}
              checked={permissions[row.key]}
              onToggle={() => togglePermission(row.key)}
              showDivider={index < SILVER_MATRIX_SECTION.rows.length - 1}
            />
          ))}
        </View>

        <MatrixCheckboxRow
          label="Permission to Edit Market Prices"
          checked={permissions.edit_market_prices}
          onToggle={() => togglePermission('edit_market_prices')}
        />

        <View style={styles.accessBox}>
          {WEIGHT_ACCESS_ROWS.map((row, index) => (
            <MatrixCheckboxRow
              key={row.key}
              label={row.label}
              checked={permissions[row.key]}
              onToggle={() => togglePermission(row.key)}
              variant="dark"
              showDivider={index < WEIGHT_ACCESS_ROWS.length - 1}
            />
          ))}
        </View>

        {EXTRA_SECTIONS.map((section) => (
          <PermissionCard
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
            rows={section.rows}
            permissions={permissions}
            onToggle={togglePermission}
          />
        ))}

        <PermissionCard
          title="Settings Access"
          subtitle="Optional settings screens this employee can open"
          rows={SETTINGS_PERMISSION_ROWS}
          permissions={permissions}
          onToggle={togglePermission}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleContinue}
          disabled={saving}
          style={[styles.continueBtn, saving && styles.continueBtnDisabled]}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
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
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 120,
  },
  section: {
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 4,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  accessBox: {
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.input,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  permissionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginTop: 12,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  permissionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  continueBtn: {
    height: Spacing.buttonHeight,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 12,
    textAlign: 'center',
  },
});
