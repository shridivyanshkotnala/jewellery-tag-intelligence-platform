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
      {/* ─── Header row: title + tag code + delete ─── */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>{item.tagCode}</Text>
          </View>
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

      {/* ─── Price badge ─── */}
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>{item.priceBadge}</Text>
      </View>

      {/* ─── Scan timestamp ─── */}
      <Text style={styles.timestamp}>
        {formatWishlistTimestamp(item.scanTimestamp || item.addedAt)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
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
  tagPill: {
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  deleteBtn: {
    padding: 4,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: Radius.badge,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  timestamp: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
});

