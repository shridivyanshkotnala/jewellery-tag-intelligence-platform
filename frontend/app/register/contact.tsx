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
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { API_BASE_URL } from '@/constants/api';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { submitBusinessContactDetails } from '@/utils/authApi';
import { validateEmail, validatePhone } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const BUTTON_GREEN = '#1E2F28';

export default function ContactDetailsScreen() {
  const router = useRouter();
  const registration = useAuthStore((s) => s.registration);
  const updateRegistration = useAuthStore((s) => s.updateRegistration);

  const [phone, setPhone] = useState(registration.phone || '');
  const [email, setEmail] = useState(registration.email || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const pErr = validatePhone(phone);
    const eErr = validateEmail(email);
    setPhoneError(pErr);
    setEmailError(eErr);
    if (pErr || eErr) return;

    setLoading(true);
    try {
      if (!registration.businessId) {
        setEmailError('Please verify GST details again before continuing.');
        return;
      }

      updateRegistration({ phone, email: email.trim().toLowerCase() });
      await submitBusinessContactDetails({
        businessId: registration.businessId,
        phone,
        email: email.trim().toLowerCase(),
      });
      router.push('/register/otp-phone');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP.';
      if (
        message.includes('Registration session expired') ||
        message.includes('REGISTRATION_SESSION_EXPIRED') ||
        message.includes('verify GST again')
      ) {
        updateRegistration({ businessId: undefined });
        setEmailError('Session expired after backend restart. Please verify GST again.');
        return;
      }
      setEmailError(message);
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
              <Text style={styles.cardTitle}>Enter Contact Details</Text>
              <Text style={styles.cardDescription}>
                Enter your Phone Number and E mail id to verify identity.
              </Text>

              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.phoneRow, phoneError ? styles.inputError : null]}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <ChevronDown size={14} color={Colors.textMuted} />
                </View>
                <TextInput
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/\D/g, '').slice(0, 10));
                    setPhoneError(null);
                  }}
                  placeholder="9999999999"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="phone-pad"
                  style={styles.phoneInput}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

              <Text style={[styles.inputLabel, styles.emailLabel]}>Email</Text>
              <View style={[styles.emailRow, emailError ? styles.inputError : null]}>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError(null);
                  }}
                  placeholder="you@business.com"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.emailInput}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              {__DEV__ ? (
                <Text style={styles.devHint}>Dev API: {API_BASE_URL}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleContinue}
                disabled={loading}
                activeOpacity={0.9}
                style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.continueBtnText}>Continue</Text>
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
  emailLabel: {
    marginTop: 20,
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
  emailRow: {
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emailInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: Colors.dangerText,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 8,
  },
  devHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 12,
  },
  continueBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
