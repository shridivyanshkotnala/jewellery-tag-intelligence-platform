import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MoreVertical, SlidersHorizontal, X } from 'lucide-react-native';

import { Colors, Spacing } from '@/constants/theme';

interface WishlistScreenHeaderProps {
  onClearWishlist: () => void;
}

export function WishlistScreenHeader({ onClearWishlist }: WishlistScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <X size={22} color={Colors.textPrimary} />
        </Pressable>
       
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Wishlist</Text>
        <Pressable onPress={onClearWishlist} hitSlop={8}>
          <Text style={styles.clearLink}>Clear Wishlist</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl, // Increase spacing between top bar and title
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background, // Subtle background for icon buttons
    borderRadius: 18,
  },
  brand: {
    flex: 1,
    marginHorizontal: Spacing.md,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 32, // Make it a bit larger and prominent
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  clearLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4, // Align text baseline with the large title
  },
});
