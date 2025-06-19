import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tag, Hash, Edit3 } from 'lucide-react-native';
import { Spacing, Typography, PredefinedCategories } from '../constants';
import { Cycle } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface SessionInfoDisplayProps {
  cycle: Cycle | null;
  onEditPress: () => void;
}

export function SessionInfoDisplay({ cycle, onEditPress }: SessionInfoDisplayProps) {
  const { colors } = useTheme();
  
  if (!cycle) return null;

  const categoryData = cycle.category 
    ? PredefinedCategories.find(cat => cat.id === cycle.category) 
    : null;

  const hasCycleInfo = cycle.label || cycle.category;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Cycle Info</Text>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.background }]} onPress={onEditPress}>
          <Edit3 size={16} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {hasCycleInfo ? (
        <View style={styles.content}>
          {cycle.label && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Tag size={16} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.infoText, { color: colors.text }]}>{cycle.label}</Text>
            </View>
          )}
          
          {cycle.category && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Hash size={16} color={colors.accent} strokeWidth={2} />
              </View>
              <View style={styles.categoryInfo}>
                {categoryData && (
                  <View style={[styles.categoryIcon, { backgroundColor: categoryData.color }]}>
                    <Text style={styles.categoryEmoji}>{categoryData.icon}</Text>
                  </View>
                )}
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {categoryData?.name || cycle.category}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity style={[styles.addButton, { borderColor: colors.border }]} onPress={onEditPress}>
          <Text style={[styles.addButtonText, { color: colors.muted }]}>+ Add label & category</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
    flex: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 12,
  },
  addButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
  },
}); 