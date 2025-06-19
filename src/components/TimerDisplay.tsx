import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, TouchableOpacity } from 'react-native';
import { Play, Pause, Edit3 } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing, PredefinedCategories } from '../constants';
import { TimerState, Cycle } from '../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerDisplayProps {
  timeRemaining: number; // in seconds
  sessionType: 'work' | 'shortBreak' | 'longBreak' | null;
  isRunning: boolean;
  totalDuration?: number; // in seconds, for calculating progress
  timerState: TimerState;
  cycleDuration: number; // Total work sessions per cycle
  currentCycle: Cycle | null; // Current cycle for showing label/category
  defaultLabel: string; // Default label for future cycles
  defaultCategory: string; // Default category for future cycles
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEdit: () => void; // Handler for edit button
}

export function TimerDisplay({ 
  timeRemaining, 
  sessionType, 
  isRunning, 
  totalDuration, 
  timerState,
  cycleDuration,
  currentCycle,
  defaultLabel,
  defaultCategory,
  onStart,
  onPause,
  onResume,
  onEdit
}: TimerDisplayProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return Colors.primary;
      case 'shortBreak':
      case 'longBreak':
        return Colors.secondary;
      default:
        return Colors.muted;
    }
  };

  const getSessionLabel = () => {
    // Show cycle info if available
    if (currentCycle?.label && currentCycle.label.trim()) {
      const label = currentCycle.label;
      const category = currentCycle.category;
      
      // Show both label and category icon if both are available
      if (category && category.trim()) {
        const categoryData = PredefinedCategories.find(cat => cat.id === category);
        const categoryIcon = categoryData?.icon || '📝'; // Default icon for custom categories
        return `${label} ${categoryIcon}`;
      }
      
      // Show just the label if no category
      return label;
    }
    
    // Show default label/category if set (even when no cycle is active)
    if (defaultLabel && defaultLabel.trim()) {
      const label = defaultLabel;
      const category = defaultCategory;
      
      // Show both label and category icon if both are available
      if (category && category.trim()) {
        const categoryData = PredefinedCategories.find(cat => cat.id === category);
        const categoryIcon = categoryData?.icon || '📝'; // Default icon for custom categories
        return `${label} ${categoryIcon}`;
      }
      
      // Show just the label if no category
      return label;
    }
    
    // Fall back to generic session type labels
    switch (sessionType) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Ready to start?';
    }
  };

  // Calculate progress for circular indicator
  const getProgress = () => {
    if (!totalDuration || totalDuration === 0) return 0;
    const elapsed = totalDuration - timeRemaining;
    return Math.max(0, Math.min(1, elapsed / totalDuration));
  };

  // Calculate current work session by counting actual work sessions in cycle
  const getCurrentWorkSession = () => {
    if (!currentCycle) {
      return 0; // No cycle = no work sessions yet
    }
    
    // Count work sessions from the cycle's sessions array
    const workSessionsInCycle = currentCycle.sessions.filter(
      session => session.type === 'work'
    ).length;
    
    // If currently in a work session, add 1 to show current progress
    if (sessionType === 'work' && timerState !== 'idle') {
      return workSessionsInCycle + 1;
    }
    
    return workSessionsInCycle;
  };

  // Render session dots horizontally inside the circle
  const renderSessionDots = () => {
    const dots = [];
    const currentWorkSession = getCurrentWorkSession();
    
    for (let i = 0; i < cycleDuration; i++) {
      const isActive = i < currentWorkSession;
      
      dots.push(
        <View 
        key={i} 
        style={[styles.sessionDotIndicator, { backgroundColor: isActive ? Colors.primary : Colors.muted }]}
        />
      );
    }
    
    return dots;
  };

  // SVG circle properties
  const size = 280;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Animate progress changes
  useEffect(() => {
    const targetProgress = getProgress();
    
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: isRunning ? 1000 : 500, // Longer duration when running for smoother animation
      useNativeDriver: false, // SVG animations don't support native driver
    }).start();
  }, [timeRemaining, totalDuration, isRunning]);

  // Convert animated value to stroke dash offset
  const animatedStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const handleButtonPress = () => {
    switch (timerState) {
      case 'idle':
      case 'completed':
        onStart();
        break;
      case 'running':
        onPause();
        break;
      case 'paused':
        onResume();
        break;
    }
  };

  const getButtonContent = () => {
    switch (timerState) {
      case 'idle':
        return {
          icon: <Play size={24} color={Colors.white} strokeWidth={2} fill={Colors.white} />,
          text: 'Start',
          color: Colors.primary,
        };
      case 'running':
        return {
          icon: <Pause size={24} color={Colors.white} strokeWidth={2} fill={Colors.white} />,
          text: 'Pause',
          color: Colors.accent,
        };
      case 'paused':
        return {
          icon: <Play size={24} color={Colors.white} strokeWidth={2} fill={Colors.white} />,
          text: 'Resume',
          color: Colors.secondary,
        };
      case 'completed':
        return {
          icon: <Play size={24} color={Colors.white} strokeWidth={2} fill={Colors.white} />,
          text: 'Start Next',
          color: Colors.primary,
        };
      default:
        return {
          icon: <Play size={24} color={Colors.white} strokeWidth={2} fill={Colors.white} />,
          text: 'Start',
          color: Colors.primary,
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.labelContainer} onPress={onEdit} activeOpacity={0.7}>
        <View style={styles.editButton}>
          <Edit3 size={16} color={Colors.primary} strokeWidth={2} />
        </View>
        <Text style={[styles.sessionLabel, { color: getSessionColor() }]}>
          {getSessionLabel()}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.timerContainer}>
        {/* SVG Circular Progress */}
        <Svg
          width={size}
          height={size}
          style={styles.progressSvg}
        >
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.muted + '40'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getSessionColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={animatedStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity={0.9}
          />
        </Svg>
        
        {/* Timer content overlay */}
        <View style={styles.timerContent}>
          {/* Centered Timer Text */}
          <Text style={[styles.timerText, { color: getSessionColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
          
          {/* Status positioned above timer text */}
          {sessionType && (
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: isRunning ? getSessionColor() : Colors.muted }
              ]} />
              <Text style={styles.statusText}>
                {isRunning ? 'Running' : 'Paused'}
              </Text>
            </View>
          )}
          
          {/* Button positioned below timer text */}
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: buttonContent.color }]}
            onPress={handleButtonPress}
            activeOpacity={0.8}
          >
            {buttonContent.icon}
          </TouchableOpacity>
          
          <View style={styles.sessionDotsContainer}>
            {renderSessionDots()}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sessionLabel: {
    fontSize: Typography.sizes.header,
    fontWeight: Typography.weights.medium,
    fontFamily: Typography.families.bold,
    textAlign: 'center',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timerContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 140,
  },
  progressSvg: {
    position: 'absolute',
    transform: [{ rotate: '0deg' }],
  },
  timerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 240,
    height: 240,
    backgroundColor: Colors.white,
    borderRadius: 120,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  timerText: {
    fontSize: Typography.sizes.timer,
    fontFamily: Typography.families.black,
    textAlign: 'center',
    position: 'absolute',
  },
  controlButton: {
    position: 'absolute',
    marginTop: 120,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statusContainer: {
    position: 'absolute',
    marginBottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.sizes.caption,
    color: Colors.muted,
    fontWeight: Typography.weights.medium,
    fontFamily: Typography.families.regular,
  },
  sessionDotsContainer: {
    position: 'absolute',
    top: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sessionDotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.85,
  },
}); 