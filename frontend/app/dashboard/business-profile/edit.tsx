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
import { BottomNav } from '@/components/dashboard/BottomNav';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { getEditableBusinessProfile } from '@/utils/businessProfile';
import { verifyBusinessGst } from '@/utils/authApi';
import { normalizeGstNumber, validateEmail, validateGst, validatePhone } from '@/utils/validation';

const ACCENT_TAN = '#D4C19C';
const BUTTON_GREEN = '#1E2F28';
const BUSINESS_BOX_BG = '#F4F5F7';

export default function EditBusinessProfileScreen() {
  const router = useRouter();
  const registration = useAuthStore((s) => s.registration);
  const updateRegistration = useAuthStore((s) => s.updateRegistration);
  const initial = getEditableBusinessProfile(registration);

  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [gstNumber, setGstNumber] = useState(initial.gstNumber);
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [isGstVerified, setIsGstVerified] = useState(true);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [gstError, setGstError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleVerifyGst = async () => {
    const error = validateGst(gstNumber);
    setGstError(error);
    if (error) return;

    setVerifyLoading(true);
    try {
      const result = await verifyBusinessGst(gstNumber);
      if (result.success && result.businessName) {
        setBusinessName(result.businessName);
        setIsGstVerified(true);
        setGstError(null);
      } else {
        setGstError(result.error ?? 'Verification failed');
        setIsGstVerified(false);
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleUpdate = async () => {
    const pErr = validatePhone(phone);
    const eErr = validateEmail(email);
    const gErr = !isGstVerified ? 'Please verify GST number first' : null;

    setPhoneError(pErr);
    setEmailError(eErr);
    setGstError(gErr);
    if (pErr || eErr || gErr) return;

    setUpdateLoading(true);
    try {
      updateRegistration({
        phone,
        email: email.trim(),
        gstNumber: normalizeGstNumber(gstNumber),
        businessName,
      });
      router.back();
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
              <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Buisness Profile</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.phoneRow, phoneError ? styles.inputRowError : null]}>
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
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                style={styles.phoneInput}
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(null);
              }}
              placeholder="email@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.textInput, emailError ? styles.textInputError : null]}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={styles.inputLabel}>Edit GST Number</Text>
            <View style={[styles.inputRow, gstError ? styles.inputRowError : null]}>
              <TextInput
                value={gstNumber}
                onChangeText={(text) => {
                  setGstNumber(text.toUpperCase());
                  setIsGstVerified(false);
                  setGstError(null);
                }}
                placeholder="GSTNXXXXXXXXXXXX"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                editable={!verifyLoading}
                style={styles.gstInput}
              />
              <TouchableOpacity
                onPress={handleVerifyGst}
                disabled={verifyLoading}
                activeOpacity={0.9}
                style={[styles.verifyBtn, verifyLoading && styles.verifyBtnDisabled]}
              >
                {verifyLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.verifyBtnText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
            {gstError ? <Text style={styles.errorText}>{gstError}</Text> : null}

            <View style={styles.businessNameBox}>
              <Text style={styles.businessNameText} numberOfLines={2}>
                {businessName}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={updateLoading}
              activeOpacity={0.9}
              style={[styles.updateBtn, updateLoading && styles.updateBtnDisabled]}
            >
              {updateLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.updateBtnText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  form: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: 12,
    height: '100%',
    minHeight: Spacing.inputHeight,
    justifyContent: 'center',
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
  textInput: {
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textInputError: {
    borderColor: Colors.dangerText,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    paddingLeft: 16,
    paddingRight: 4,
  },
  inputRowError: {
    borderColor: Colors.dangerText,
  },
  gstInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  verifyBtn: {
    height: 40,
    minWidth: 76,
    backgroundColor: ACCENT_TAN,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  verifyBtnDisabled: {
    opacity: 0.7,
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
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
    marginTop: 16,
  },
  businessNameText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  updateBtn: {
    height: Spacing.buttonHeight,
    width: '100%',
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  updateBtnDisabled: {
    opacity: 0.7,
  },
  updateBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
