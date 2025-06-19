import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, TrendingUp, Award, Calendar } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants';
import { Goals } from '../types';
import { DurationPicker } from './DurationPicker';

interface GoalSettingsProps {
  goals: Goals;
  onGoalChange: (key: keyof Goals, value: number) => void;
}

export function GoalSettings({ goals, onGoalChange }: GoalSettingsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Goals & Targets</Text>
      
      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <Target size={20} color={Colors.primary} strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Daily Cycles</Text>
            <Text style={styles.goalDescription}>
              Target number of cycles per day
            </Text>
          </View>
        </View>
        <DurationPicker
          value={goals.dailyCycles}
          onChange={(value: number) => onGoalChange('dailyCycles', value)}
          min={1}
          max={20}
          suffix="sessions"
        />
      </View>

      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <Calendar size={20} color={Colors.secondary} strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Weekly Cycles</Text>
            <Text style={styles.goalDescription}>
              Target number of cycles per week
            </Text>
          </View>
        </View>
        <DurationPicker
          value={goals.weeklyCycles}
          onChange={(value: number) => onGoalChange('weeklyCycles', value)}
          min={5}
          max={100}
          suffix="sessions"
        />
      </View>

      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <TrendingUp size={20} color={Colors.accent} strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Daily Focus Time</Text>
            <Text style={styles.goalDescription}>
              Target focus time in minutes per day
            </Text>
          </View>
        </View>
        <DurationPicker
          value={goals.dailyFocusTime}
          onChange={(value: number) => onGoalChange('dailyFocusTime', value)}
          min={25}
          max={600}
          suffix="min"
        />
      </View>

      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <Award size={20} color="#f39c12" strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Streak Target</Text>
            <Text style={styles.goalDescription}>
              Target consecutive days to maintain
            </Text>
          </View>
        </View>
        <DurationPicker
          value={goals.streakTarget}
          onChange={(value: number) => onGoalChange('streakTarget', value)}
          min={3}
          max={365}
          suffix="days"
        />
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>💡 Goal Setting Tips</Text>
        <Text style={styles.tipText}>
          • Start with achievable goals and gradually increase
        </Text>
        <Text style={styles.tipText}>
          • Daily focus time = Daily cycles × Work duration
        </Text>
        <Text style={styles.tipText}>
          • Consistent small goals are better than unrealistic big ones
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.header - 2,
    fontFamily: Typography.families.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted + '10',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
  goalDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.muted,
    marginTop: 2,
  },
  tipContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.accent + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  tipTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
}); 