import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, TrendingUp, Award, Calendar } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants';
import { StorageService } from '../utils/storage';
import { Goals } from '../types';

interface GoalProgressProps {
  completedCycles: number;
  goals: Goals;
}

export function GoalProgress({ completedCycles, goals }: GoalProgressProps) {
  const [todayFocusTime, setTodayFocusTime] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadTodayData();
  }, []);

  // Refresh data when completed cycles changes
  useEffect(() => {
    loadTodayData();
  }, [completedCycles]);

  const loadTodayData = async () => {
    const todayStats = await StorageService.getTodayStats();
    const streak = await StorageService.getCurrentStreak();
    setTodayFocusTime(todayStats.totalFocusTime);
    setCurrentStreak(streak);
  };

  const dailyCycleProgress = Math.min((completedCycles / goals.dailyCycles) * 100, 100);
  const dailyFocusProgress = Math.min((todayFocusTime / goals.dailyFocusTime) * 100, 100);
  const streakProgress = Math.min((currentStreak / goals.streakTarget) * 100, 100);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#27ae60'; // Green - Goal achieved
    if (progress >= 75) return Colors.secondary; // Light green - Close to goal
    if (progress >= 50) return Colors.accent; // Orange - Making progress
    return Colors.primary; // Red - Need more work
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Progress</Text>
      
      <View style={styles.goalsGrid}>
        {/* Daily Goal */}
        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <Target size={16} color={getProgressColor(dailyCycleProgress)} strokeWidth={2} />
            <Text style={styles.goalLabel}>Cycles</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${dailyCycleProgress}%`,
                    backgroundColor: getProgressColor(dailyCycleProgress)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedCycles}/{goals.dailyCycles}
            </Text>
          </View>
        </View>

        {/* Daily Focus Time Goal */}
        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <TrendingUp size={16} color={getProgressColor(dailyFocusProgress)} strokeWidth={2} />
            <Text style={styles.goalLabel}>Focus Time</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${dailyFocusProgress}%`,
                    backgroundColor: getProgressColor(dailyFocusProgress)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {formatTime(todayFocusTime)}/{formatTime(goals.dailyFocusTime)}
            </Text>
          </View>
        </View>

        {/* Streak Progress */}
        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <Award size={16} color={getProgressColor(streakProgress)} strokeWidth={2} />
            <Text style={styles.goalLabel}>Streak</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${streakProgress}%`,
                    backgroundColor: getProgressColor(streakProgress)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStreak}/{goals.streakTarget} days
            </Text>
          </View>
        </View>
      </View>

      {/* Motivational message */}
      {dailyCycleProgress >= 100 ? (
        <View style={styles.congratsContainer}>
          <Text style={styles.congratsText}>🎉 Daily goal achieved!</Text>
        </View>
      ) : (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {goals.dailyCycles - completedCycles} more to reach your daily goal!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  goalsGrid: {
    gap: Spacing.md,
  },
  goalItem: {
    marginBottom: Spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  goalLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
    color: Colors.text,
    minWidth: 60,
    textAlign: 'right',
  },
  congratsContainer: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#27ae60' + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  congratsText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
    color: '#27ae60',
  },
  motivationContainer: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.primary,
    textAlign: 'center',
  },
}); 