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
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { createBusinessPassword } from '@/utils/authApi';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const BUTTON_GREEN = '#1D2E28';

export default function CreatePasswordScreen() {
  const router = useRouter();
  const registration = useAuthStore((s) => s.registration);
  const updateRegistration = useAuthStore((s) => s.updateRegistration);
  const setSavedCredentials = useAuthStore((s) => s.setSavedCredentials);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const pErr = validatePassword(password);
    const cErr = validateConfirmPassword(password, confirmPassword);
    setPasswordError(pErr);
    setConfirmError(cErr);
    setFormError(null);
    if (pErr || cErr) return;

    setLoading(true);
    try {
      if (!registration.businessId) {
        setFormError('Missing business id. Please restart registration.');
        return;
      }

      const result = await createBusinessPassword({
        businessId: registration.businessId,
        password,
        confirmPassword,
      });

      if (result.success) {
        const email = registration.email ?? '';
        const phone = registration.phone ?? '';
        updateRegistration({
          password,
          email,
          phone,
          businessName: registration.businessName,
          gstNumber: registration.gstNumber,
          businessId: registration.businessId,
        });
        if (email) {
          setSavedCredentials(email, phone);
        }
        router.replace('/login');
      } else {
        setFormError(result.error ?? 'Registration failed');
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

            <Text style={styles.headerTitle}>Register as Buisness</Text>

            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>Already have an account? </Text>
              <Pressable onPress={() => router.replace('/login')}>
                <Text style={styles.headerLink}>Log In</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.cardScroll}
            >
              <Text style={styles.cardTitle}>Create Password</Text>
              <Text style={styles.cardDescription}>
                Create a strong password to protect your account.
              </Text>

              <Text style={styles.inputLabel}>Create Password</Text>
              <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError(null);
                  }}
                  placeholder="Enter password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
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

              <Text style={[styles.inputLabel, styles.confirmLabel]}>Confirm Password</Text>
              <View style={[styles.inputRow, confirmError ? styles.inputError : null]}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmError(null);
                  }}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  style={styles.textInput}
                />
                <Pressable
                  onPress={() => setShowConfirm((v) => !v)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  {showConfirm ? (
                    <Eye size={20} color={Colors.textMuted} />
                  ) : (
                    <EyeOff size={20} color={Colors.textMuted} />
                  )}
                </Pressable>
              </View>
              {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Confirm & Register</Text>
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
    backgroundColor: '#F9F9F9',
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
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  headerLink: {
    fontSize: 14,
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
    paddingTop: 28,
    paddingBottom: 32,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 8,
  },
  confirmLabel: {
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
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
    letterSpacing: 0.5,
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
  submitBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
