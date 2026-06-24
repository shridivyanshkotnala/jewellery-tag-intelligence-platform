import { useEffect, useRef, useState } from 'react';
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
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { DevOtpBanner } from '@/components/ui/DevOtpBanner';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useDevOtp } from '@/hooks/useDevOtp';
import { useAuthStore } from '@/store/authStore';
import { submitBusinessContactDetails, verifyBusinessPhoneOtp } from '@/utils/authApi';
import { maskPhone, validateOtp } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const BUTTON_GREEN = '#1E2F28';
const OTP_LENGTH = 6;

export default function OtpPhoneScreen() {
  const router = useRouter();
  const registration = useAuthStore((s) => s.registration);
  const phone = registration.phone ?? '';
  const email = registration.email ?? '';
  const businessId = registration.businessId;
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [devOtpRefresh, setDevOtpRefresh] = useState(0);
  const devOtp = useDevOtp(businessId, 'phone', devOtpRefresh);

  const digits = otp.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH);

  const handleOtpChange = (text: string) => {
    setOtp(text.replace(/\D/g, '').slice(0, OTP_LENGTH));
    setOtpError(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = async () => {
    const error = validateOtp(otp);
    setOtpError(error);
    if (error) return;

    setLoading(true);
    try {
      if (!businessId) {
        setOtpError('Missing business id. Please restart registration.');
        return;
      }
      const result = await verifyBusinessPhoneOtp(businessId, otp);
      if (result.success) {
        router.push('/register/otp-email');
      } else {
        setOtpError(result.error ?? 'Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      if (!businessId) {
        setOtpError('Missing business id. Please restart registration.');
        return;
      }
      await submitBusinessContactDetails({ businessId, phone, email });
      setOtp('');
      setOtpError(null);
      setDevOtpRefresh((key) => key + 1);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
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
              <Text style={styles.cardTitle}>OTP Verification</Text>
              <Text style={styles.cardDescription}>
                Enter the verification code we just sent to your number {maskPhone(phone)}.
              </Text>

              {devOtp ? <DevOtpBanner label="Dev phone OTP" otp={devOtp} /> : null}

              <View style={styles.otpInputWrapper}>
                <View style={styles.otpRow} pointerEvents="none">
                  {digits.map((digit, index) => (
                    <View key={index} style={styles.otpBox}>
                      <Text style={styles.otpDigit}>{digit.trim() ? digit : ''}</Text>
                    </View>
                  ))}
                </View>
                <TextInput
                  ref={inputRef}
                  value={otp}
                  onChangeText={handleOtpChange}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  style={styles.otpOverlayInput}
                  caretHidden
                  autoFocus
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                  textContentType="oneTimeCode"
                  importantForAutofill="yes"
                />
              </View>

              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

              <Pressable onPress={handleResend} disabled={resendLoading} style={styles.resendRow}>
                <Text style={styles.resendText}>
                  Didn&apos;t receive code?{' '}
                  <Text style={styles.resendLink}>
                    {resendLoading ? 'Sending...' : 'Resend'}
                  </Text>
                </Text>
              </Pressable>

              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.9}
                style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.verifyBtnText}>Verify OTP</Text>
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
    color: Colors.textLabel,
    marginTop: 8,
  },
  otpInputWrapper: {
    position: 'relative',
    marginTop: 24,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  otpOverlayInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 8,
  },
  resendRow: {
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  resendLink: {
    fontWeight: '500',
    color: ACCENT_TAN,
    textDecorationLine: 'underline',
  },
  verifyBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  verifyBtnDisabled: {
    opacity: 0.7,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
