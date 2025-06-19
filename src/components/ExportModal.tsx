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
import { Colors, Typography, Spacing } from '../constants';
import { DataExportService, ExportOptions } from '../utils/dataExport';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ExportModal({ visible, onClose }: ExportModalProps) {
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Export Data</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Export Format */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Format</Text>
            <View style={styles.formatOptions}>
              <TouchableOpacity
                style={[styles.formatOption, options.format === 'json' && styles.formatOptionActive]}
                onPress={() => updateOption('format', 'json')}
              >
                <FileText size={20} color={options.format === 'json' ? Colors.white : Colors.primary} />
                <Text style={[styles.formatOptionText, options.format === 'json' && styles.formatOptionTextActive]}>
                  JSON
                </Text>
                <Text style={[styles.formatOptionDescription, options.format === 'json' && styles.formatOptionDescriptionActive]}>
                  Machine readable
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formatOption, options.format === 'csv' && styles.formatOptionActive]}
                onPress={() => updateOption('format', 'csv')}
              >
                <Database size={20} color={options.format === 'csv' ? Colors.white : Colors.primary} />
                <Text style={[styles.formatOptionText, options.format === 'csv' && styles.formatOptionTextActive]}>
                  CSV
                </Text>
                <Text style={[styles.formatOptionDescription, options.format === 'csv' && styles.formatOptionDescriptionActive]}>
                  Spreadsheet friendly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateRangeOptions}>
              {[
                { key: 'all', label: 'All Time', icon: Calendar },
                { key: 'month', label: 'Last 30 Days', icon: Calendar },
                { key: 'week', label: 'Last 7 Days', icon: Calendar },
              ].map(({ key, label, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.dateRangeOption, options.dateRange === key && styles.dateRangeOptionActive]}
                  onPress={() => updateOption('dateRange', key as ExportOptions['dateRange'])}
                >
                  <Icon size={16} color={options.dateRange === key ? Colors.primary : Colors.muted} />
                  <Text style={[styles.dateRangeOptionText, options.dateRange === key && styles.dateRangeOptionTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Include Data</Text>
            
            <View style={styles.dataOption}>
              <View style={styles.dataOptionInfo}>
                <Settings size={18} color={Colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={styles.dataOptionLabel}>Settings</Text>
                  <Text style={styles.dataOptionDescription}>
                    Timer preferences and goals
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeSettings}
                onValueChange={(value) => updateOption('includeSettings', value)}
                trackColor={{ false: Colors.muted + '40', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.dataOption}>
              <View style={styles.dataOptionInfo}>
                <FileText size={18} color={Colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={styles.dataOptionLabel}>Session History</Text>
                  <Text style={styles.dataOptionDescription}>
                    Individual timer sessions
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeSessions}
                onValueChange={(value) => updateOption('includeSessions', value)}
                trackColor={{ false: Colors.muted + '40', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.dataOption}>
              <View style={styles.dataOptionInfo}>
                <Target size={18} color={Colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={styles.dataOptionLabel}>Pomodoro Cycles</Text>
                  <Text style={styles.dataOptionDescription}>
                    Complete cycles with labels and categories
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeCycles}
                onValueChange={(value) => updateOption('includeCycles', value)}
                trackColor={{ false: Colors.muted + '40', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.dataOption}>
              <View style={styles.dataOptionInfo}>
                <Database size={18} color={Colors.text} />
                <View style={styles.dataOptionTexts}>
                  <Text style={styles.dataOptionLabel}>Statistics</Text>
                  <Text style={styles.dataOptionDescription}>
                    Daily summaries and streaks
                  </Text>
                </View>
              </View>
              <Switch
                value={options.includeStats}
                onValueChange={(value) => updateOption('includeStats', value)}
                trackColor={{ false: Colors.muted + '40', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Preview</Text>
            <View style={styles.previewCard}>
              {loading ? (
                <View style={styles.previewLoading}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.previewLoadingText}>Loading preview...</Text>
                </View>
              ) : preview ? (
                <View style={styles.previewContent}>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Date Range:</Text>
                    <Text style={styles.previewValue}>{preview.dateRange}</Text>
                  </View>
                  {options.includeSessions && (
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Sessions:</Text>
                      <Text style={styles.previewValue}>{preview.sessionsCount} sessions</Text>
                    </View>
                  )}
                  {options.includeStats && (
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Daily Stats:</Text>
                      <Text style={styles.previewValue}>{preview.statsCount} days</Text>
                    </View>
                  )}
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Estimated Size:</Text>
                    <Text style={styles.previewValue}>{preview.estimatedSize}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>

        {/* Export Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Download size={20} color={Colors.white} strokeWidth={2} />
            )}
            <Text style={styles.exportButtonText}>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted + '20',
  },
  headerTitle: {
    fontSize: Typography.sizes.header,
    fontFamily: Typography.families.black,
    color: Colors.text,
  },
  closeButton: {
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
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  formatOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  formatOption: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  formatOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  formatOptionText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  formatOptionTextActive: {
    color: Colors.white,
  },
  formatOptionDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.muted,
    marginTop: 2,
  },
  formatOptionDescriptionActive: {
    color: Colors.white + 'CC',
  },
  dateRangeOptions: {
    gap: Spacing.sm,
  },
  dateRangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.muted + '20',
  },
  dateRangeOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  dateRangeOptionText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
    color: Colors.text,
  },
  dateRangeOptionTextActive: {
    fontFamily: Typography.families.bold,
    color: Colors.primary,
  },
  dataOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
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
  },
  dataOptionLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
  dataOptionDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.muted,
    marginTop: 2,
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.muted + '20',
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
    color: Colors.muted,
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
    color: Colors.muted,
  },
  previewValue: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.muted + '20',
  },
  exportButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.primary,
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
    color: Colors.white,
  },
}); 