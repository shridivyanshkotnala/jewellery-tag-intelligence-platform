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
import { ChevronLeft, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { Colors, Radius, Spacing } from '@/constants/theme';

const ACCENT_GOLD = '#D4C19C';
const BUTTON_GREEN = '#1B3022';

export default function PasswordManagerScreen() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState('Old Password123');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('Password@123');
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.back();
    } finally {
      setUpdating(false);
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
              <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
            </Pressable>
            <Text style={styles.headerTitle}>Password Manager</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Old Password</Text>
            <TextInput
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Old Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={false}
              autoCapitalize="none"
              style={styles.input}
            />
            <Pressable hitSlop={8} style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot Old Password ?</Text>
            </Pressable>

            <Text style={styles.label}>New Password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={false}
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                style={styles.inputField}
              />
              <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                <EyeOff size={20} color={Colors.textMuted} />
              </Pressable>
            </View>

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={updating}
              activeOpacity={0.9}
              style={[styles.updateBtn, updating && styles.updateBtnDisabled]}
            >
              {updating ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.updateBtnText}>Update Password</Text>
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
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
    color: ACCENT_GOLD,
  },
  inputRow: {
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  updateBtn: {
    height: Spacing.buttonHeight,
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
