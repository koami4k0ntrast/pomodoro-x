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
import { X, Save, RotateCcw, Download, Share } from 'lucide-react-native';
import { Colors, Typography, Spacing, DefaultGoals } from '../constants';
import { Settings, Goals } from '../types';
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
              theme: 'light',
              goals: DefaultGoals,
            };
            setLocalSettings(defaultSettings);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Save size={18} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <X size={20} color={Colors.text} strokeWidth={2} />
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timer Durations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timer Durations</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Work Session</Text>
            <DurationPicker
              value={localSettings.workDuration}
              onChange={(value: number) => updateSetting('workDuration', value)}
              min={1}
              max={60}
              suffix="min"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Short Break</Text>
            <DurationPicker
              value={localSettings.shortBreakDuration}
              onChange={(value: number) => updateSetting('shortBreakDuration', value)}
              min={1}
              max={30}
              suffix="min"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Long Break</Text>
            <DurationPicker
              value={localSettings.longBreakDuration}
              onChange={(value: number) => updateSetting('longBreakDuration', value)}
              min={5}
              max={60}
              suffix="min"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Cycle Duration</Text>
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
          <Text style={styles.sectionTitle}>Auto-Start</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.switchContainer}>
              <Text style={styles.settingLabel}>Auto-start breaks</Text>
              <Text style={styles.settingDescription}>
                Automatically start break sessions when work completes
              </Text>
            </View>
            <Switch
              value={localSettings.autoStartBreaks}
              onValueChange={(value: boolean) => updateSetting('autoStartBreaks', value)}
              trackColor={{ false: Colors.muted + '40', true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.switchContainer}>
              <Text style={styles.settingLabel}>Auto-start work sessions</Text>
              <Text style={styles.settingDescription}>
                Automatically start work sessions when breaks complete
              </Text>
            </View>
            <Switch
              value={localSettings.autoStartWorkSessions}
              onValueChange={(value: boolean) => updateSetting('autoStartWorkSessions', value)}
              trackColor={{ false: Colors.muted + '40', true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Sound & Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.switchContainer}>
              <Text style={styles.settingLabel}>Sound notifications</Text>
              <Text style={styles.settingDescription}>
                Play sound when sessions complete
              </Text>
            </View>
            <Switch
              value={localSettings.soundEnabled}
              onValueChange={(value: boolean) => updateSetting('soundEnabled', value)}
              trackColor={{ false: Colors.muted + '40', true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          {localSettings.soundEnabled && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Volume</Text>
              <VolumeSlider
                value={localSettings.volume}
                onChange={(value: number) => updateSetting('volume', value)}
              />
            </View>
          )}
        </View>

        {/* Goals & Targets */}
        <GoalSettings 
          goals={localSettings.goals}
          onGoalChange={updateGoal}
        />

        {/* Data Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity 
            style={styles.exportButton} 
            onPress={() => setShowExportModal(true)}
          >
            <View style={styles.exportButtonContent}>
              <Download size={18} color={Colors.primary} strokeWidth={2} />
              <View style={styles.exportButtonTexts}>
                <Text style={styles.exportButtonLabel}>Export Data</Text>
                <Text style={styles.exportButtonDescription}>
                  Download your productivity data for backup or analysis
                </Text>
              </View>
            </View>
            <Share size={16} color={Colors.muted} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Reset Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={18} color="#e74c3c" strokeWidth={2} />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
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
    backgroundColor: Colors.background,
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
    color: Colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted + '10',
  },
  settingLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
  settingDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.muted,
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
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 25,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  resetButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: '#e74c3c',
  },
  exportButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.muted + '20',
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
    color: Colors.text,
  },
  exportButtonDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.muted,
    marginTop: 2,
  },
}); 