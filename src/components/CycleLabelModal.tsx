import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { X, Check, Tag, Hash } from 'lucide-react-native';
import { Colors, Spacing, Typography, PredefinedCategories, QuickLabels } from '../constants';

interface CycleLabelModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (label: string, category: string) => void;
  initialLabel?: string;
  initialCategory?: string;
}

export function CycleLabelModal({
  visible,
  onClose,
  onSave,
  initialLabel = '',
  initialCategory = '',
}: CycleLabelModalProps) {
  const [label, setLabel] = useState(initialLabel);
  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (visible) {
      setLabel(initialLabel);
      setCategory(initialCategory);
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  }, [visible, initialLabel, initialCategory]);

  const handleSave = () => {
    const finalCategory = showCustomCategory ? customCategory : category;
    onSave(label.trim(), finalCategory.trim());
    onClose();
  };

  const selectQuickLabel = (quickLabel: string) => {
    setLabel(quickLabel);
  };

  const selectCategory = (categoryId: string) => {
    setCategory(categoryId);
    setShowCustomCategory(false);
  };

  const selectedCategoryData = PredefinedCategories.find(cat => cat.id === category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <X size={24} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Label Cycle</Text>
          <TouchableOpacity 
            style={[styles.headerButton, styles.saveButton]} 
            onPress={handleSave}
          >
            <Check size={24} color={Colors.white} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Session Label Input */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag size={20} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Cycle Label</Text>
            </View>
            
            <TextInput
              style={styles.textInput}
              value={label}
              onChangeText={setLabel}
              placeholder="What are you working on?"
              placeholderTextColor={Colors.muted}
              multiline
              textAlignVertical="top"
            />

            {/* Quick Labels */}
            <Text style={styles.subTitle}>Quick Labels</Text>
            <View style={styles.quickLabels}>
              {QuickLabels.map((quickLabel) => (
                <TouchableOpacity
                  key={quickLabel}
                  style={[
                    styles.quickLabelChip,
                    label === quickLabel && styles.quickLabelChipSelected,
                  ]}
                  onPress={() => selectQuickLabel(quickLabel)}
                >
                  <Text
                    style={[
                      styles.quickLabelText,
                      label === quickLabel && styles.quickLabelTextSelected,
                    ]}
                  >
                    {quickLabel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Hash size={20} color={Colors.accent} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Category</Text>
            </View>

            <View style={styles.categories}>
              {PredefinedCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => selectCategory(cat.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Category */}
            <TouchableOpacity
              style={styles.customCategoryToggle}
              onPress={() => setShowCustomCategory(!showCustomCategory)}
            >
              <Text style={styles.customCategoryToggleText}>
                {showCustomCategory ? 'Use Predefined Categories' : 'Add Custom Category'}
              </Text>
            </TouchableOpacity>

            {showCustomCategory && (
              <TextInput
                style={styles.textInput}
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder="Enter custom category name"
                placeholderTextColor={Colors.muted}
              />
            )}
          </View>

          {/* Current Selection Summary */}
          {(label || category || customCategory) && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Cycle Summary</Text>
              <View style={styles.summaryContent}>
                {label && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Label:</Text>
                    <Text style={styles.summaryValue}>{label}</Text>
                  </View>
                )}
                {(category || customCategory) && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Category:</Text>
                    <View style={styles.summaryCategory}>
                      {selectedCategoryData && !showCustomCategory && (
                        <View style={[styles.summaryCategoryIcon, { backgroundColor: selectedCategoryData.color }]}>
                          <Text style={styles.summaryCategoryEmoji}>{selectedCategoryData.icon}</Text>
                        </View>
                      )}
                      <Text style={styles.summaryValue}>
                        {showCustomCategory ? customCategory : selectedCategoryData?.name}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted + '30',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.sizes.header,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
  subTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
    color: Colors.muted,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.muted + '30',
    minHeight: 60,
  },
  quickLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickLabelChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.muted + '30',
  },
  quickLabelChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickLabelText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.text,
  },
  quickLabelTextSelected: {
    color: Colors.white,
  },
  categories: {
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.muted + '30',
    gap: Spacing.md,
  },
  categoryItemSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '10',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
    color: Colors.text,
    flex: 1,
  },
  categoryTextSelected: {
    fontFamily: Typography.families.bold,
    color: Colors.accent,
  },
  customCategoryToggle: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  customCategoryToggleText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
    color: Colors.accent,
  },
  summary: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  summaryTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  summaryContent: {
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
    color: Colors.muted,
    minWidth: 60,
  },
  summaryValue: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
    color: Colors.text,
    flex: 1,
  },
  summaryCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  summaryCategoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCategoryEmoji: {
    fontSize: 14,
  },
}); 