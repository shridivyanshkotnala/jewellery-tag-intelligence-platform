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
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { confirmBusinessGst, verifyBusinessGst } from '@/utils/authApi';
import { normalizeGstNumber, validateGst } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const CONFIRM_GREEN = '#1E2F28';
const BUSINESS_BOX_BG = '#F4F5F7';

export default function GstVerificationScreen() {
  const router = useRouter();
  const updateRegistration = useAuthStore((s) => s.updateRegistration);

  const [gstNumber, setGstNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstVerified, setGstVerified] = useState(false);
  const [gstError, setGstError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyGst = async () => {
    const error = validateGst(gstNumber);
    setGstError(error);
    if (error) return;

    setLoading(true);
    setBusinessName('');
    setGstVerified(false);
    try {
      const result = await verifyBusinessGst(gstNumber);
      if (!result.success) {
        setGstError(result.error ?? 'GST verification failed');
        return;
      }

      setBusinessName(result.businessName ?? '');
      setGstVerified(true);
    } catch (error) {
      setGstError(error instanceof Error ? error.message : 'GST verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndContinue = async () => {
    if (!gstVerified) {
      await handleVerifyGst();
      return;
    }

    const error = validateGst(gstNumber);
    setGstError(error);
    if (error) return;

    setLoading(true);
    try {
      const confirmed = await confirmBusinessGst(gstNumber);
      updateRegistration({
        businessId: confirmed.businessId,
        gstNumber: normalizeGstNumber(gstNumber),
        businessName,
      });
      router.push('/register/contact');
    } catch (error) {
      setGstError(error instanceof Error ? error.message : 'Failed to confirm GST details.');
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
              <Text style={styles.cardTitle}>GST Verification</Text>
              <Text style={styles.cardDescription}>
                Enter your GST number to verify with the government registry.
              </Text>

              <Text style={styles.inputLabel}>GST Number</Text>

              <View style={[styles.inputRow, gstError ? styles.inputRowError : null]}>
                <TextInput
                  value={gstNumber}
                  onChangeText={(text) => {
                    setGstNumber(text.toUpperCase());
                    setBusinessName('');
                    setGstVerified(false);
                    setGstError(null);
                  }}
                  placeholder="26ABCDE1234F1Z5"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  editable={!loading}
                  style={styles.textInput}
                />
              </View>

              {gstError ? <Text style={styles.errorText}>{gstError}</Text> : null}

              {businessName ? (
                <View style={styles.businessNameBox}>
                  <Text style={styles.businessNameLabel}>Verified business</Text>
                  <Text style={styles.businessNameText} numberOfLines={2}>
                    {businessName}
                  </Text>
                </View>
              ) : null}

              {!gstVerified ? (
                <TouchableOpacity
                  onPress={handleVerifyGst}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.continueBtnText}>Verify GST</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleConfirmAndContinue}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.continueBtnText}>Confirm & Continue</Text>
                  )}
                </TouchableOpacity>
              )}
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
    backgroundColor: '#F8F8F8',
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
  inputRowError: {
    borderColor: Colors.dangerText,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    marginTop: 8,
  },
  businessNameBox: {
    minHeight: Spacing.inputHeight,
    justifyContent: 'center',
    backgroundColor: BUSINESS_BOX_BG,
    borderRadius: Radius.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  businessNameLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  businessNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  continueBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: CONFIRM_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
