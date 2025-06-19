import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { X, Save, RotateCcw, Download, Share, Moon, Sun, Smartphone } from 'lucide-react-native';
import { Typography, Spacing, DefaultGoals } from '../constants';
import { Settings, Goals } from '../types';
import { useTheme, ThemePreference } from '../contexts/ThemeContext';
import { DurationPicker } from './DurationPicker';
import { VolumeSlider } from './VolumeSlider';
import { GoalSettings } from './GoalSettings';
import { ExportModal } from './ExportModal';

interface SettingsScreenProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsScreen({ settings, onSettingsChange, onClose }: SettingsScreenProps) {
  const { colors, themePreference, setThemePreference, systemTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showExportModal, setShowExportModal] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateGoal = (key: keyof Goals, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      goals: { ...prev.goals, [key]: value }
    }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings: Settings = {
              workDuration: 25,
              shortBreakDuration: 5,
              longBreakDuration: 15,
              cycleDuration: 4,
              soundEnabled: true,
              soundType: 'default',
              volume: 80,
              autoStartBreaks: false,
              autoStartWorkSessions: false,
              theme: 'auto',
              goals: DefaultGoals,
            };
            setLocalSettings(defaultSettings);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleSave} style={[styles.headerButton, { backgroundColor: colors.surface }]}>
            <Save size={18} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={[styles.headerButton, { backgroundColor: colors.surface }]}>
          <X size={20} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timer Durations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timer Durations</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Work Session</Text>
            <DurationPicker
              value={localSettings.workDuration}
              onChange={(value: number) => updateSetting('workDuration', value)}
              min={1}
              max={60}
              suffix="min"
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Short Break</Text>
            <DurationPicker
              value={localSettings.shortBreakDuration}
              onChange={(value: number) => updateSetting('shortBreakDuration', value)}
              min={1}
              max={30}
              suffix="min"
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Long Break</Text>
            <DurationPicker
              value={localSettings.longBreakDuration}
              onChange={(value: number) => updateSetting('longBreakDuration', value)}
              min={5}
              max={60}
              suffix="min"
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Cycle Duration</Text>
            <DurationPicker
              value={localSettings.cycleDuration}
              onChange={(value: number) => updateSetting('cycleDuration', value)}
              min={2}
              max={10}
              suffix="sessions"
            />
          </View>
        </View>

        {/* Auto-Start Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Auto-Start</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
            <View style={styles.switchContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Auto-start breaks</Text>
              <Text style={[styles.settingDescription, { color: colors.muted }]}>
                Automatically start break sessions when work completes
              </Text>
            </View>
            <Switch
              value={localSettings.autoStartBreaks}
              onValueChange={(value: boolean) => updateSetting('autoStartBreaks', value)}
              trackColor={{ false: colors.muted + '40', true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
            <View style={styles.switchContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Auto-start work sessions</Text>
              <Text style={[styles.settingDescription, { color: colors.muted }]}>
                Automatically start work sessions when breaks complete
              </Text>
            </View>
            <Switch
              value={localSettings.autoStartWorkSessions}
              onValueChange={(value: boolean) => updateSetting('autoStartWorkSessions', value)}
              trackColor={{ false: colors.muted + '40', true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Sound & Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sound & Notifications</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
            <View style={styles.switchContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sound notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.muted }]}>
                Play sound when sessions complete
              </Text>
            </View>
            <Switch
              value={localSettings.soundEnabled}
              onValueChange={(value: boolean) => updateSetting('soundEnabled', value)}
              trackColor={{ false: colors.muted + '40', true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {localSettings.soundEnabled && (
            <View style={[styles.settingItem, { borderBottomColor: colors.muted + '10' }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Volume</Text>
              <VolumeSlider
                value={localSettings.volume}
                onChange={(value: number) => updateSetting('volume', value)}
              />
            </View>
          )}
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={styles.themeContainer}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            <Text style={[styles.settingDescription, { color: colors.muted, marginBottom: Spacing.md }]}>
              Choose your preferred app appearance
            </Text>
            
            <View style={styles.themeOptions}>
              {/* Auto Theme */}
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: themePreference === 'auto' ? colors.primary : colors.border,
                    borderWidth: 2 
                  }
                ]}
                onPress={() => {
                  setThemePreference('auto');
                  updateSetting('theme', 'auto');
                }}
              >
                <View style={[styles.themeIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Smartphone size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Auto</Text>
                <Text style={[styles.themeOptionSubtitle, { color: colors.muted }]}>
                  Follow system
                </Text>
              </TouchableOpacity>

              {/* Light Theme */}
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: themePreference === 'light' ? colors.primary : colors.border,
                    borderWidth: 2 
                  }
                ]}
                onPress={() => {
                  setThemePreference('light');
                  updateSetting('theme', 'light');
                }}
              >
                <View style={[styles.themeIcon, { backgroundColor: colors.accent + '20' }]}>
                  <Sun size={20} color={colors.accent} strokeWidth={2} />
                </View>
                <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Light</Text>
                <Text style={[styles.themeOptionSubtitle, { color: colors.muted }]}>
                  Always light mode
                </Text>
              </TouchableOpacity>

              {/* Dark Theme */}
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: themePreference === 'dark' ? colors.primary : colors.border,
                    borderWidth: 2 
                  }
                ]}
                onPress={() => {
                  setThemePreference('dark');
                  updateSetting('theme', 'dark');
                }}
              >
                <View style={[styles.themeIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <Moon size={20} color={colors.secondary} strokeWidth={2} />
                </View>
                <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Dark</Text>
                <Text style={[styles.themeOptionSubtitle, { color: colors.muted }]}>
                  Always dark mode
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Goals & Targets */}
        <GoalSettings 
          goals={localSettings.goals}
          onGoalChange={updateGoal}
        />

        {/* Data Export */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Privacy</Text>
          
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => setShowExportModal(true)}
          >
            <View style={styles.exportButtonContent}>
              <Download size={18} color={colors.primary} strokeWidth={2} />
              <View style={styles.exportButtonTexts}>
                <Text style={[styles.exportButtonLabel, { color: colors.text }]}>Export Data</Text>
                <Text style={[styles.exportButtonDescription, { color: colors.muted }]}>
                  Download your productivity data for backup or analysis
                </Text>
              </View>
            </View>
            <Share size={16} color={colors.muted} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Reset Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.resetButton, { backgroundColor: colors.surface, borderColor: colors.error }]} onPress={handleReset}>
            <RotateCcw size={18} color={colors.error} strokeWidth={2} />
            <Text style={[styles.resetButtonText, { color: colors.error }]}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ExportModal 
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </SafeAreaView>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  settingDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    marginTop: 2,
  },
  switchContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  resetButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  exportButton: {
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  exportButtonTexts: {
    flex: 1,
  },
  exportButtonLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  exportButtonDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    marginTop: 2,
  },
  // Theme Selection Styles
  themeContainer: {
    paddingVertical: Spacing.sm,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  themeOption: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  themeOptionTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    marginBottom: 2,
  },
  themeOptionSubtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    textAlign: 'center',
  },
}); 