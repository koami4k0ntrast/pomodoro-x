import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Square, SkipForward } from 'lucide-react-native';
import { Typography, Spacing } from '../constants';
import { TimerState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();
  
  const renderPrimaryButton = () => {
    switch (timerState) {
      case 'idle':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]} 
            onPress={onStart}
            activeOpacity={0.8}
          >
            <Play size={20} color={colors.white} strokeWidth={2} fill={colors.white} />
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Start
            </Text>
          </TouchableOpacity>
        );
      
      case 'running':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.accent, shadowColor: colors.shadow }]} 
            onPress={onPause}
            activeOpacity={0.8}
          >
            <Pause size={20} color={colors.white} strokeWidth={2} fill={colors.white} />
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Pause
            </Text>
          </TouchableOpacity>
        );
      
      case 'paused':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.secondary, shadowColor: colors.shadow }]} 
            onPress={onResume}
            activeOpacity={0.8}
          >
            <Play size={20} color={colors.white} strokeWidth={2} fill={colors.white} />
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Resume
            </Text>
          </TouchableOpacity>
        );
      
      case 'completed':
        return (
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]} 
            onPress={onStart}
            activeOpacity={0.8}
          >
            <Play size={20} color={colors.white} strokeWidth={2} fill={colors.white} />
            <Text style={[styles.buttonText, { color: colors.white }]}>
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
            style={[
              styles.secondaryButton, 
              { 
                borderColor: colors.error, 
                backgroundColor: colors.error + '15',
                shadowColor: colors.shadow
              }
            ]} 
            onPress={onStop}
            activeOpacity={0.8}
          >
            <Square size={16} color={colors.error} strokeWidth={2} fill={colors.error} />
            <Text style={[styles.buttonText, { color: colors.error }]}>
              Stop
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.secondaryButton, 
              { 
                borderColor: colors.accent, 
                backgroundColor: colors.accent + '15',
                shadowColor: colors.shadow
              }
            ]} 
            onPress={onSkip}
            activeOpacity={0.8}
          >
            <SkipForward size={16} color={colors.accent} strokeWidth={2} />
            <Text style={[styles.buttonText, { color: colors.accent }]}>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    borderWidth: 2,
    minWidth: 80,
    justifyContent: 'center',
    gap: Spacing.xs,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    fontFamily: Typography.families.bold,
    textAlign: 'center',
  },
}); 