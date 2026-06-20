import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { EmployeeScreenHeader } from '@/components/employees/EmployeeScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useEmployeeDraftStore } from '@/store/employeeDraftStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { fetchEmployees, finalizeEmployeeCreation } from '@/utils/employeeApi';

const BUTTON_GREEN = '#1B3022';
const INPUT_BG = '#F4F5F7';

export default function CreateEmployeePasswordScreen() {
  const router = useRouter();
  const draft = useEmployeeDraftStore((s) => s.draft);
  const updateDraft = useEmployeeDraftStore((s) => s.updateDraft);
  const resetDraft = useEmployeeDraftStore((s) => s.resetDraft);
  const mode = useEmployeeDraftStore((s) => s.mode);
  const editEmployeeId = useEmployeeDraftStore((s) => s.editEmployeeId);

  const setEmployees = useEmployeeStore((s) => s.setEmployees);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setFormError(null);
    const nextErrors = {
      password: !draft.password.trim() ? 'Password is required' : null,
      confirmPassword:
        draft.password !== draft.confirmPassword ? 'Passwords do not match' : null,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      if (mode === 'edit' && editEmployeeId) {
        updateEmployee(editEmployeeId, {
          fullName: draft.fullName,
          phone: draft.phone,
          email: draft.email,
          gender: draft.gender,
          designation: draft.designation,
          password: draft.password,
          permissions: draft.permissions,
        });
        resetDraft();
        router.replace(`/dashboard/employees/${editEmployeeId}` as Href);
        return;
      }

      const result = await finalizeEmployeeCreation(draft.password);
      if (!result.success) {
        setFormError(result.error ?? 'Failed to create employee.');
        return;
      }

      const listResult = await fetchEmployees();
      if (listResult.success && listResult.data) {
        setEmployees(listResult.data);
      }

      resetDraft();
      router.replace('/dashboard/employees' as Href);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EmployeeScreenHeader title={'Create\nPassword'} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>CREATE PASSWORD FOR EMPLOYEE</Text>

            <Text style={styles.label}>Create Password</Text>
            <View style={[styles.inputRow, errors.password ? styles.inputError : null]}>
              <TextInput
                value={draft.password}
                onChangeText={(text) => updateDraft({ password: text })}
                placeholder="PASSWORD"
                placeholderTextColor={Colors.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="characters"
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                {showPassword ? (
                  <Eye size={20} color={Colors.textMuted} />
                ) : (
                  <EyeOff size={20} color={Colors.textMuted} />
                )}
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputRow, errors.confirmPassword ? styles.inputError : null]}>
              <TextInput
                value={draft.confirmPassword}
                onChangeText={(text) => updateDraft({ confirmPassword: text })}
                placeholder="••••••••"
                placeholderTextColor={Colors.placeholder}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                style={styles.input}
              />
              <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                {showConfirm ? (
                  <Eye size={20} color={Colors.textMuted} />
                ) : (
                  <EyeOff size={20} color={Colors.textMuted} />
                )}
              </Pressable>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={saving}
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'edit' ? 'Update Password' : 'Add Employee'}
              </Text>
            )}
          </TouchableOpacity>
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 12,
  },
  inputRow: {
    minHeight: 48,
    backgroundColor: INPUT_BG,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.dangerText,
  },
  error: {
    fontSize: 12,
    color: Colors.dangerText,
    marginTop: 6,
  },
  submitBtn: {
    height: Spacing.buttonHeight,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
