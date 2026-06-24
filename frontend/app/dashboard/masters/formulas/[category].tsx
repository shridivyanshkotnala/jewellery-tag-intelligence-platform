import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MasterFormulaConfig } from '@/components/dashboard/masters/MasterFormulaConfig';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import {
  MASTER_CATEGORY_LABELS,
  MASTER_FORMULA_LABELS,
  parseFormulaCategory,
} from '@/constants/settingsMasters';
import { screenStyles } from '@/constants/screenLayout';
import { Spacing } from '@/constants/theme';

export default function MasterFormulaDetailScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const key = parseFormulaCategory(category);
  const title = MASTER_FORMULA_LABELS[key];

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />
      <PageHeader
        title={title}
        subtitle={`Settings → Masters → Formulas → ${MASTER_CATEGORY_LABELS[key]}`}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={screenStyles.screenSection}>
          <MasterFormulaConfig />
        </View>
      </ScrollView>
      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.screenBottom,
  },
});
