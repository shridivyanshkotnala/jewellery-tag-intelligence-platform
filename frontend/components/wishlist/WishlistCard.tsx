import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { WishlistItem } from '@/types/wishlist';
import { formatWishlistTimestamp } from '@/utils/wishlistUtils';

interface WishlistCardProps {
  item: WishlistItem;
  onPress: () => void;
  onDelete: () => void;
}

export function WishlistCard({ item, onPress, onDelete }: WishlistCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {/* ─── Header row: title + delete ─── */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={12}
          style={styles.deleteBtn}
        >
          <Trash2 size={18} color="#E53935" />
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        {/* ─── Price badge ─── */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.priceBadge}</Text>
        </View>

        {/* ─── Scan timestamp ─── */}
        <Text style={styles.timestamp}>
          {formatWishlistTimestamp(item.scanTimestamp || item.addedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: '#E8E8E8', // Explicitly visible subtle border
    padding: Spacing.xl, // Increased padding
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3, // Stronger elevation for Android
  },
  cardPressed: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  deleteBtn: {
    padding: 6,
    backgroundColor: Colors.dangerBg,
    borderRadius: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.badge,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
});

