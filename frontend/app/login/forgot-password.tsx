import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthHeader } from '@/components/ui/AuthHeader';
import { FormCard } from '@/components/ui/FormCard';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TabSwitcher } from '@/components/ui/TabSwitcher';
import { TextField } from '@/components/ui/TextField';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePhone } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const loginMethod = useAuthStore((s) => s.loginMethod);
  const setLoginMethod = useAuthStore((s) => s.setLoginMethod);
  const savedEmail = useAuthStore((s) => s.savedEmail);
  const savedPhone = useAuthStore((s) => s.savedPhone);

  const [email, setEmail] = useState(savedEmail || '');
  const [phone, setPhone] = useState(savedPhone || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleContinue = () => {
    setInfoMessage(null);

    if (loginMethod === 'email') {
      const eErr = validateEmail(email);
      setEmailError(eErr);
      setPhoneError(null);
      if (eErr) return;
    } else {
      const pErr = validatePhone(phone);
      setPhoneError(pErr);
      setEmailError(null);
      if (pErr) return;
    }

    setInfoMessage(
      'Password reset is not available in the app yet. Please sign in with your registered business email and password.',
    );
  };

  return (
    <ScreenContainer scrollable>
      <AuthHeader
        title="Login as a Business"
        subtitle="Don't have an account?"
        linkText="Sign Up"
        onLinkPress={() => router.replace('/register/gst')}
      />

      <FormCard>
        <TabSwitcher
          tabs={[
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
          ]}
          activeTab={loginMethod}
          onTabChange={(key) => setLoginMethod(key as 'email' | 'phone')}
        />

        <Text className="mb-1 text-xl font-bold text-text-primary">Forgot Password?</Text>
        <Text className="mb-5 text-sm leading-5 text-text-secondary">
          {loginMethod === 'phone'
            ? 'Enter your registered phone number.'
            : 'Enter your registered business email.'}
        </Text>

        {loginMethod === 'email' ? (
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={emailError}
          />
        ) : (
          <PhoneInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            error={phoneError}
          />
        )}

        {infoMessage ? (
          <Text className="mb-3 text-sm leading-5 text-text-secondary">{infoMessage}</Text>
        ) : null}

        <PrimaryButton title="Continue" onPress={handleContinue} />

        <Pressable onPress={() => router.replace('/login')} style={{ marginTop: 16, alignSelf: 'center' }}>
          <Text className="text-sm font-medium text-accent underline">Back to Login</Text>
        </Pressable>
      </FormCard>
    </ScreenContainer>
  );
}
