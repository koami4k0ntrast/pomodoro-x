import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Settings, Square, SkipForward, BarChart3 } from 'lucide-react-native';
import { useTimer } from '../contexts/TimerContext';
import { TimerDisplay } from './TimerDisplay';
import { CycleLabelModal } from './CycleLabelModal';
import { GoalProgress } from './GoalProgress';
import { Colors, Spacing, Typography } from '../constants';

interface TimerScreenProps {
  onOpenSettings: () => void;
  onOpenStatistics: () => void;
}

export function TimerScreen({ onOpenSettings, onOpenStatistics }: TimerScreenProps) {
  const {
    currentSession,
    currentCycle,
    timeRemaining,
    timerState,
    completedCycles,
    nextSessionType,
    settings,
    defaultLabel,
    defaultCategory,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipTimer,
    updateCycleLabel,
    setDefaultLabel,
  } = useTimer();

  const [showLabelModal, setShowLabelModal] = useState(false);

  const handleStart = () => {
    if (timerState === 'idle') {
      // If there's a suggested next session type, use it, otherwise default to work
      const sessionType = nextSessionType || 'work';
      startTimer(sessionType);
    }
  };

  const handleEditCycleInfo = () => {
    setShowLabelModal(true);
  };

  const handleSaveCycleLabel = async (label: string, category: string) => {
    await updateCycleLabel(label, category);
    // Also update the default labels for future cycles
    setDefaultLabel(label, category);
    setShowLabelModal(false);
  };

  // Calculate total duration for progress calculation
  const getTotalDuration = () => {
    if (!currentSession) return 0;
    return currentSession.duration * 60; // Convert minutes to seconds
  };

  // Show secondary buttons only when timer is running or paused
  const showSecondaryButtons = timerState === 'running' || timerState === 'paused';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header with Settings */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>PomodoroX</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={onOpenStatistics}>
            <BarChart3 size={20} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={onOpenSettings}>
            <Settings size={20} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TimerDisplay
            timeRemaining={timeRemaining}
            sessionType={currentSession?.type || null}
            isRunning={timerState === 'running'}
            totalDuration={getTotalDuration()}
            timerState={timerState}
            cycleDuration={settings.cycleDuration}
            currentCycle={currentCycle}
            defaultLabel={defaultLabel}
            defaultCategory={defaultCategory}
            onStart={handleStart}
            onPause={pauseTimer}
            onResume={resumeTimer}
            onEdit={handleEditCycleInfo}
          />

          {/* Secondary Control Buttons - Above session info */}
          <View style={[styles.secondaryButtons, { opacity: showSecondaryButtons ? 1 : 0 }]}>
            <TouchableOpacity 
              style={[styles.secondaryButton, styles.stopButton]} 
              onPress={stopTimer}
              activeOpacity={0.8}
            >
              <Square size={16} color="#e74c3c" strokeWidth={2} />
              <Text style={[styles.buttonText, styles.stopButtonText]}>
                Stop
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryButton, styles.skipButton]} 
              onPress={skipTimer}
              activeOpacity={0.8}
            >
              <SkipForward size={16} color={Colors.accent} strokeWidth={2} />
              <Text style={[styles.buttonText, styles.skipButtonText]}>
                Skip
              </Text>
            </TouchableOpacity>
          </View>

          {/* Goal Progress Display */}
          <GoalProgress 
            completedCycles={completedCycles}
            goals={settings.goals}
          />
        </View>
      </ScrollView>

      {/* Cycle Label Modal */}
      <CycleLabelModal
        visible={showLabelModal}
        onClose={() => setShowLabelModal(false)}
        onSave={handleSaveCycleLabel}
        initialLabel={currentCycle?.label || defaultLabel}
        initialCategory={currentCycle?.category || defaultCategory}
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
  appTitle: {
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    minHeight: '100%',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -Spacing.lg,
    gap: Spacing.md,
    width: "100%",
  },
  secondaryButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.muted,
    backgroundColor: Colors.white,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  stopButton: {
    borderColor: '#e74c3c',
  },
  skipButton: {
    borderColor: Colors.accent,
  },
  buttonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    fontFamily: Typography.families.bold,
    textAlign: 'center',
  },
  stopButtonText: {
    color: '#e74c3c',
  },
  skipButtonText: {
    color: Colors.accent,
  },
  leftButton: {
    position: 'absolute',
    left: 0,
  },
  rightButton: {
    position: 'absolute',
    right: 0,
  },
}); 