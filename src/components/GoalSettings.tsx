import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, TrendingUp, Award, Calendar } from 'lucide-react-native';
import { Spacing, Typography } from '../constants';
import { Goals } from '../types';
import { DurationPicker } from './DurationPicker';
import { useTheme } from '../contexts/ThemeContext';

interface GoalSettingsProps {
  goals: Goals;
  onGoalChange: (key: keyof Goals, value: number) => void;
}

export function GoalSettings({ goals, onGoalChange }: GoalSettingsProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals & Targets</Text>
      
      <View style={[styles.goalItem, { borderBottomColor: colors.muted + '10' }]}>
        <View style={styles.goalHeader}>
          <Target size={20} color={colors.primary} strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={[styles.goalLabel, { color: colors.text }]}>Daily Cycles</Text>
            <Text style={[styles.goalDescription, { color: colors.muted }]}>
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

      <View style={[styles.goalItem, { borderBottomColor: colors.muted + '10' }]}>
        <View style={styles.goalHeader}>
          <Calendar size={20} color={colors.secondary} strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={[styles.goalLabel, { color: colors.text }]}>Weekly Cycles</Text>
            <Text style={[styles.goalDescription, { color: colors.muted }]}>
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

      <View style={[styles.goalItem, { borderBottomColor: colors.muted + '10' }]}>
        <View style={styles.goalHeader}>
          <TrendingUp size={20} color={colors.accent} strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={[styles.goalLabel, { color: colors.text }]}>Daily Focus Time</Text>
            <Text style={[styles.goalDescription, { color: colors.muted }]}>
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

      <View style={[styles.goalItem, { borderBottomColor: colors.muted + '10' }]}>
        <View style={styles.goalHeader}>
          <Award size={20} color={colors.warning} strokeWidth={2} />
          <View style={styles.goalInfo}>
            <Text style={[styles.goalLabel, { color: colors.text }]}>Streak Target</Text>
            <Text style={[styles.goalDescription, { color: colors.muted }]}>
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

      <View style={[styles.tipContainer, { backgroundColor: colors.accent + '10', borderLeftColor: colors.accent }]}>
        <Text style={[styles.tipTitle, { color: colors.text }]}>💡 Goal Setting Tips</Text>
        <Text style={[styles.tipText, { color: colors.text }]}>
          • Start with achievable goals and gradually increase
        </Text>
        <Text style={[styles.tipText, { color: colors.text }]}>
          • Daily focus time = Daily cycles × Work duration
        </Text>
        <Text style={[styles.tipText, { color: colors.text }]}>
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
    marginBottom: Spacing.lg,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  goalInfo: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  goalLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  goalDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    marginTop: 2,
  },
  tipContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  tipTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
}); 