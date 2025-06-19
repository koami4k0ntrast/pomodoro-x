import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { X, Download, FileText, Database, Calendar, Settings, Target } from 'lucide-react-native';
import { Typography, Spacing } from '../constants';
import { DataExportService, ExportOptions } from '../utils/dataExport';
import { useTheme } from '../contexts/ThemeContext';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ExportModal({ visible, onClose }: ExportModalProps) {
  const { colors } = useTheme();
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    dateRange: 'all',
    includeSettings: true,
    includeSessions: true,
    includeCycles: true,
    includeStats: true,
  });

  const [preview, setPreview] = useState<{
    sessionsCount: number;
    cyclesCount: number;
    statsCount: number;
    dateRange: string;
    estimatedSize: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPreview();
    }
  }, [visible, options]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const previewData = await DataExportService.getExportPreview(options);
      setPreview(previewData);
    } catch (error) {
      console.error('Error loading preview:', error);
    }
    setLoading(false);
  };

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    if (!options.includeSettings && !options.includeSessions && !options.includeCycles && !options.includeStats) {
      Alert.alert('No Data Selected', 'Please select at least one type of data to export.');
      return;
    }

    setExporting(true);
    try {
      await DataExportService.exportData(options);
      Alert.alert(
        'Export Successful',
        'Your data has been exported successfully! You can now share or save the file.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred.',
        [{ text: 'OK' }]
      );
    }
    setExporting(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Export Data</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={onClose} style={[styles.headerButton, { backgroundColor: colors.surface /*, shadowColor: colors.shadow */}]}>
              <X size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Export Format */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Format</Text>
            <View style={styles.formatOptions}>
              <TouchableOpacity
                style={[
                  styles.formatOption, 
                  { backgroundColor: colors.surface, borderColor: colors.primary + '20' },
                  options.format === 'json' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => updateOption('format', 'json')}
              >
                <FileText size={20} color={options.format === 'json' ? colors.background : colors.primary} />
                <Text style={[
                  styles.formatOptionText, 
                  { color: colors.text },
                  options.format === 'json' && { color: colors.background }
                ]}>
                  JSON
                </Text>
                <Text style={[
                  styles.formatOptionDescription, 
                  { color: colors.muted },
                  options.format === 'json' && { color: colors.background + 'CC' }
                ]}>
                  Machine readable
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.formatOption, 
                  { backgroundColor: colors.surface, borderColor: colors.primary + '20' },
                  options.format === 'csv' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => updateOption('format', 'csv')}
              >
                <Database size={20} color={options.format === 'csv' ? colors.background : colors.primary} />
                <Text style={[
                  styles.formatOptionText, 
                  { color: colors.text },
                  options.format === 'csv' && { color: colors.background }
                ]}>
                  CSV
                </Text>
                <Text style={[
                  styles.formatOptionDescription, 
                  { color: colors.muted },
                  options.format === 'csv' && { color: colors.background + 'CC' }
                ]}>
                  Spreadsheet friendly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Range</Text>
            <View style={styles.dateRangeOptions}>
              {[
                { key: 'all', label: 'All Time', icon: Calendar },
                { key: 'month', label: 'Last 30 Days', icon: Calendar },
                { key: 'week', label: 'Last 7 Days', icon: Calendar },
              ].map(({ key, label, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.dateRangeOption, 
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    options.dateRange === key && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => updateOption('dateRange', key as ExportOptions['dateRange'])}
                >
                  <Icon size={16} color={options.dateRange === key ? colors.primary : colors.muted} />
                  <Text style={[
                    styles.dateRangeOptionText, 
                    { color: colors.text },
                    options.dateRange === key && { fontFamily: Typography.families.bold, color: colors.primary }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data Types */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Include Data</Text>
            
            <View style={[styles.dataOption, { backgroundColor: colors.surface }]}>
              <View style={styles.dataOptionInfo}>
                <Settings size={18} color={colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={[styles.dataOptionLabel, { color: colors.text }]}>Settings</Text>
                  <Text style={[styles.dataOptionDescription, { color: colors.muted }]}>
                    Timer preferences and goals
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeSettings}
                onValueChange={(value) => updateOption('includeSettings', value)}
                trackColor={{ false: colors.muted + '40', true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.dataOption, { backgroundColor: colors.surface }]}>
              <View style={styles.dataOptionInfo}>
                <FileText size={18} color={colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={[styles.dataOptionLabel, { color: colors.text }]}>Session History</Text>
                  <Text style={[styles.dataOptionDescription, { color: colors.muted }]}>
                    Individual timer sessions
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeSessions}
                onValueChange={(value) => updateOption('includeSessions', value)}
                trackColor={{ false: colors.muted + '40', true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.dataOption, { backgroundColor: colors.surface }]}>
              <View style={styles.dataOptionInfo}>
                <Target size={18} color={colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={[styles.dataOptionLabel, { color: colors.text }]}>Cycles</Text>
                  <Text style={[styles.dataOptionDescription, { color: colors.muted }]}>
                    Complete cycles with labels and categories
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeCycles}
                onValueChange={(value) => updateOption('includeCycles', value)}
                trackColor={{ false: colors.muted + '40', true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.dataOption, { backgroundColor: colors.surface }]}>
              <View style={styles.dataOptionInfo}>
                <Database size={18} color={colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={[styles.dataOptionLabel, { color: colors.text }]}>Statistics</Text>
                  <Text style={[styles.dataOptionDescription, { color: colors.muted }]}>
                    Daily summaries and streaks
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeStats}
                onValueChange={(value) => updateOption('includeStats', value)}
                trackColor={{ false: colors.muted + '40', true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Preview</Text>
            <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {loading ? (
                <View style={styles.previewLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.previewLoadingText, { color: colors.muted }]}>Loading preview...</Text>
                </View>
              ) : preview ? (
                <View style={styles.previewContent}>
                  <View style={styles.previewRow}>
                    <Text style={[styles.previewLabel, { color: colors.muted }]}>Date Range:</Text>
                    <Text style={[styles.previewValue, { color: colors.text }]}>{preview.dateRange}</Text>
                  </View>
                  {options.includeSessions && (
                    <View style={styles.previewRow}>
                      <Text style={[styles.previewLabel, { color: colors.muted }]}>Sessions:</Text>
                      <Text style={[styles.previewValue, { color: colors.text }]}>{preview.sessionsCount} sessions</Text>
                    </View>
                  )}
                  {options.includeStats && (
                    <View style={styles.previewRow}>
                      <Text style={[styles.previewLabel, { color: colors.muted }]}>Daily Stats:</Text>
                      <Text style={[styles.previewValue, { color: colors.text }]}>{preview.statsCount} days</Text>
                    </View>
                  )}
                  <View style={styles.previewRow}>
                    <Text style={[styles.previewLabel, { color: colors.muted }]}>Estimated Size:</Text>
                    <Text style={[styles.previewValue, { color: colors.text }]}>{preview.estimatedSize}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>

        {/* Export Button */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.exportButton, 
              { backgroundColor: colors.primary, shadowColor: colors.primary },
              exporting && styles.exportButtonDisabled
            ]}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Download size={20} color={colors.background} strokeWidth={2} />
            )}
            <Text style={[styles.exportButtonText, { color: colors.background }]}>
              {exporting ? 'Exporting...' : 'Export Data'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.header,
    fontFamily: Typography.families.black,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.header - 2,
    fontFamily: Typography.families.bold,
    marginBottom: Spacing.md,
  },
  formatOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  formatOption: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  formatOptionText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    marginTop: Spacing.sm,
  },
  formatOptionDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    marginTop: 2,
  },
  dateRangeOptions: {
    gap: Spacing.sm,
  },
  dateRangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  dateRangeOptionText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
  },
  dataOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  dataOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  dataOptionTexts: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  dataOptionLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  dataOptionDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    marginTop: 2,
  },
  previewCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  previewLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  previewLoadingText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
  },
  previewContent: {
    gap: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
  },
  previewValue: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  exportButton: {
    borderRadius: 25,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
}); 