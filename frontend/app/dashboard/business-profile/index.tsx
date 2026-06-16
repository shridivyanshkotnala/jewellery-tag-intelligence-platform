import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronLeft, SquarePen } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { BusinessProfileBanner } from '@/components/settings/BusinessProfileBanner';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { getBusinessProfile, formatProfileValue } from '@/utils/businessProfile';

const BUTTON_GREEN = '#1E2F28';

interface DetailRowProps {
  label: string;
  value: string;
  multiline?: boolean;
}

function DetailRow({ label, value, multiline }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, multiline && styles.detailValueMultiline]}
        numberOfLines={multiline ? undefined : 1}
      >
        {value}
      </Text>
    </View>
  );
}

export default function BusinessProfileScreen() {
  const router = useRouter();
  const registration = useAuthStore((s) => s.registration);
  const profile = getBusinessProfile(registration);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <BusinessProfileBanner businessName={formatProfileValue(profile.businessName, 'Your Business')} />

        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsHeaderText}>BUISNESS DETAILS</Text>
          </View>

          <View style={styles.detailsBody}>
            <DetailRow label="Name of Buisness" value={formatProfileValue(profile.businessName)} />
            <DetailRow label="GST No." value={formatProfileValue(profile.gstNumber)} />
            <DetailRow
              label="Phone No."
              value={profile.phone ? `+91 ${profile.phone}` : 'Not set'}
            />
            <DetailRow label="Email" value={formatProfileValue(profile.email)} />
            <DetailRow label="Address" value={formatProfileValue(profile.address)} multiline />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.editBtn}
          onPress={() => router.push('/dashboard/business-profile/edit' as Href)}
        >
          <SquarePen size={18} color={Colors.white} strokeWidth={2} />
          <Text style={styles.editBtnText}>Edit Buisness Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
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
  detailsCard: {
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsHeader: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailsHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  detailsBody: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 16,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 18,
  },
  detailValueMultiline: {
    lineHeight: 20,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: 24,
    height: Spacing.buttonHeight,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
