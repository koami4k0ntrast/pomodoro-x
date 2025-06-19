import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Square, SkipForward } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../constants';
import { TimerState } from '../types';

interface ControlButtonsProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip: () => void;
}

export function ControlButtons({
  timerState,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
}: ControlButtonsProps) {
  const renderPrimaryButton = () => {
    switch (timerState) {
      case 'idle':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, styles.startButton]} 
            onPress={onStart}
            activeOpacity={0.8}
          >
            <Play size={20} color={Colors.white} strokeWidth={2} fill={Colors.white} />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Start
            </Text>
          </TouchableOpacity>
        );
      
      case 'running':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, styles.pauseButton]} 
            onPress={onPause}
            activeOpacity={0.8}
          >
            <Pause size={20} color={Colors.white} strokeWidth={2} fill={Colors.white} />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Pause
            </Text>
          </TouchableOpacity>
        );
      
      case 'paused':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, styles.resumeButton]} 
            onPress={onResume}
            activeOpacity={0.8}
          >
            <Play size={20} color={Colors.white} strokeWidth={2} fill={Colors.white} />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Resume
            </Text>
          </TouchableOpacity>
        );
      
      case 'completed':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, styles.completedButton]} 
            onPress={onStart}
            activeOpacity={0.8}
          >
            <Play size={20} color={Colors.white} strokeWidth={2} fill={Colors.white} />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Start Next
            </Text>
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

  const showSecondaryButtons = timerState === 'running' || timerState === 'paused';

  return (
    <View style={styles.container}>
      {renderPrimaryButton()}
      
      {showSecondaryButtons && (
        <View style={styles.secondaryButtons}>
          <TouchableOpacity 
            style={[styles.secondaryButton, styles.stopButton]} 
            onPress={onStop}
            activeOpacity={0.8}
          >
            <Square size={16} color="#e74c3c" strokeWidth={2} fill="#e74c3c" />
            <Text style={[styles.buttonText, styles.secondaryButtonText, styles.stopButtonText]}>
              Stop
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, styles.skipButton]} 
            onPress={onSkip}
            activeOpacity={0.8}
          >
            <SkipForward size={16} color={Colors.accent} strokeWidth={2} />
            <Text style={[styles.buttonText, styles.secondaryButtonText, styles.skipButtonText]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    minWidth: 200,
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  startButton: {
    backgroundColor: Colors.primary,
  },
  pauseButton: {
    backgroundColor: Colors.accent,
  },
  resumeButton: {
    backgroundColor: Colors.secondary,
  },
  completedButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.muted,
    backgroundColor: Colors.white,
    minWidth: 80,
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
  primaryButtonText: {
    color: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.text,
  },
  stopButtonText: {
    color: '#e74c3c',
  },
  skipButtonText: {
    color: Colors.accent,
  },
}); 