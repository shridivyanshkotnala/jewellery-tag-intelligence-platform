import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';

const BRAND_GREEN = '#1A332E';

function LandingButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.buttonWrap}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <BackgroundPattern />

      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.brandName}>PRATHAM</Text>
          <Text style={styles.brandTagline}>International</Text>
        </View>

        <View style={styles.headingSection}>
          <Text style={styles.heading}>Get Started Now</Text>
        </View>

        <View style={styles.buttonSection}>
          <LandingButton
            title="Register as a Buisness"
            onPress={() => router.push('/register/gst')}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.orLine} />
          </View>

          <LandingButton
            title="Login as a Buisness"
            onPress={() => router.push('/login')}
          />

          <View style={styles.buttonGap}>
          <LandingButton
            title="Login as a Employee"
            onPress={() => router.push('/login/employee' as Href)}
          />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    flex: 0.34,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: BRAND_GREEN,
    letterSpacing: 1,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 20,
    fontWeight: '400',
    color: BRAND_GREEN,
    marginTop: 2,
    textAlign: 'center',
  },
  headingSection: {
    flex: 0.14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 34,
  },
  buttonSection: {
    flex: 0.42,
    justifyContent: 'flex-start',
    paddingTop: 8,
    alignSelf: 'stretch',
  },
  buttonWrap: {
    width: '100%',
    alignSelf: 'stretch',
  },
  button: {
    height: 52,
    width: '100%',
    backgroundColor: BRAND_GREEN,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#8E8E8E',
  },
  buttonGap: {
    marginTop: 12,
  },
});
