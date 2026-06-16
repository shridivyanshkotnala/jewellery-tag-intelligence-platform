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
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { authenticateEmployee } from '@/utils/employeeAuth';
import { validatePassword, validatePhone } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const BUTTON_GREEN = '#1E2F28';
const TAB_BG = '#F2F2F7';

type EmployeeLoginMethod = 'employeeId' | 'contact';

export default function EmployeeLoginScreen() {
  const router = useRouter();
  const employees = useEmployeeStore((s) => s.employees);
  const {
    rememberMe,
    setRememberMe,
    savedPhone,
    savedEmployeeId,
    setAuthenticated,
    setAuthToken,
    setSavedEmployeeContact,
    setUserRole,
    setLoggedInEmployee,
  } = useAuthStore();

  const [method, setMethod] = useState<EmployeeLoginMethod>('employeeId');
  const [employeeId, setEmployeeId] = useState(savedEmployeeId || '');
  const [contact, setContact] = useState(savedPhone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [employeeIdError, setEmployeeIdError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setFormError(null);
    const pErr = validatePassword(password);
    setPasswordError(pErr);

    if (method === 'employeeId') {
      const idErr = employeeId.trim().length < 4 ? 'Enter a valid Employee ID' : null;
      setEmployeeIdError(idErr);
      setContactError(null);
      if (idErr || pErr) return;
    } else {
      const phErr = validatePhone(contact);
      setContactError(phErr);
      setEmployeeIdError(null);
      if (phErr || pErr) return;
    }

    setLoading(true);
    try {
      const identifier = method === 'employeeId' ? employeeId : contact;
      const result = authenticateEmployee(employees, method, identifier, password);

      if (result.success) {
        setAuthToken(`employee-${result.employee.id}`);
        setUserRole('employee');
        setLoggedInEmployee(result.employee.id);
        setAuthenticated(true);
        if (rememberMe) {
          setSavedEmployeeContact(result.employee.employeeId, result.employee.phone);
        }
        router.replace('/dashboard');
      } else {
        setFormError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <BackgroundPattern />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
              <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
            </Pressable>

            <Text style={styles.headerTitle}>Login as an Employee</Text>

            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>Don&apos;t have an account? </Text>
              <Pressable>
                <Text style={styles.headerLink}>Contact Admin</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.cardScroll}
            >
              <View style={styles.tabRow}>
                <Pressable
                  onPress={() => setMethod('employeeId')}
                  style={[styles.tab, method === 'employeeId' && styles.tabActive]}
                >
                  <Text style={[styles.tabText, method === 'employeeId' && styles.tabTextActive]}>
                    Use Employee ID
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMethod('contact')}
                  style={[styles.tab, method === 'contact' && styles.tabActive]}
                >
                  <Text style={[styles.tabText, method === 'contact' && styles.tabTextActive]}>
                    Use Contact Details
                  </Text>
                </Pressable>
              </View>

              {method === 'employeeId' ? (
                <>
                  <Text style={styles.inputLabel}>Employee ID</Text>
                  <View style={[styles.inputRow, employeeIdError ? styles.inputError : null]}>
                    <TextInput
                      value={employeeId}
                      onChangeText={(text) => {
                        setEmployeeId(text.toUpperCase());
                        setEmployeeIdError(null);
                      }}
                      placeholder="EMP-INT-001"
                      placeholderTextColor={Colors.textMuted}
                      autoCapitalize="characters"
                      style={styles.textInput}
                    />
                  </View>
                  {employeeIdError ? <Text style={styles.errorText}>{employeeIdError}</Text> : null}
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Contact Number</Text>
                  <View style={[styles.phoneRow, contactError ? styles.inputError : null]}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                      <ChevronDown size={14} color={Colors.textMuted} />
                    </View>
                    <TextInput
                      value={contact}
                      onChangeText={(text) => {
                        setContact(text.replace(/\D/g, '').slice(0, 10));
                        setContactError(null);
                      }}
                      placeholder="9999999999"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="phone-pad"
                      style={styles.phoneInput}
                    />
                  </View>
                  {contactError ? <Text style={styles.errorText}>{contactError}</Text> : null}
                </>
              )}

              <Text style={[styles.inputLabel, styles.passwordLabel]}>Password</Text>
              <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError(null);
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={styles.textInput}
                />
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <Eye size={20} color={Colors.textMuted} />
                  ) : (
                    <EyeOff size={20} color={Colors.textMuted} />
                  )}
                </Pressable>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <View style={styles.optionsRow}>
                <Pressable
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.checkboxRow}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </Pressable>
              </View>

              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.loginBtnText}>Login</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 45,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerLink: {
    fontSize: 12,
    fontWeight: '500',
    color: ACCENT_TAN,
    textDecorationLine: 'underline',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardScroll: {
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: 24,
    paddingBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: TAB_BG,
    borderRadius: 8,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  inputError: {
    borderColor: Colors.dangerText,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: BUTTON_GREEN,
    backgroundColor: BUTTON_GREEN,
  },
  checkmark: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  loginBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
