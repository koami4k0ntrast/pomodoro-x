import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {
  X,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Award,
  BarChart3,
  RotateCcw,
} from 'lucide-react-native';
import { DailyStats, Session } from '../types';
import { StorageService } from '../utils/storage';
import { Spacing, Typography, PredefinedCategories } from '../constants';
import { useTimer } from '../contexts/TimerContext';
import { useTheme } from '../contexts/ThemeContext';

interface StatisticsScreenProps {
  onClose: () => void;
}

type TimeRange = 'today' | 'week' | 'month';

interface StatsOverview {
  totalCycles: number;
  totalFocusTime: number;
  totalBreakTime: number;
  averageSessionLength: number;
  completionRate: number;
  streak: number;
  bestDay: { date: string; cycles: number };
  categories: Record<string, number>;
}

const { width } = Dimensions.get('window');

export function StatisticsScreen({ onClose }: StatisticsScreenProps) {
  const { colors, isDark } = useTheme();
  const { refreshStats } = useTimer();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [overview, setOverview] = useState<StatsOverview>({
    totalCycles: 0,
    totalFocusTime: 0,
    totalBreakTime: 0,
    averageSessionLength: 0,
    completionRate: 0,
    streak: 0,
    bestDay: { date: '', cycles: 0 },
        categories: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      let statsData: DailyStats[] = [];
      
      switch (timeRange) {
        case 'today':
          const todayStats = await StorageService.getTodayStats();
          statsData = [todayStats];
          break;
        case 'week':
          statsData = await StorageService.getWeeklyStats();
          break;
        case 'month':
          statsData = await StorageService.getMonthlyStats();
          break;
      }
      
      setStats(statsData);
      await calculateOverview(statsData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStats = () => {
    const resetOptions = [
      {
        text: 'Cancel',
        style: 'cancel' as const,
      },
      {
        text: 'Reset Today Only',
        style: 'default' as const,
        onPress: () => confirmReset('today'),
      },
      {
        text: 'Reset All Stats',
        style: 'destructive' as const,
        onPress: () => confirmReset('all'),
      },
    ];

    Alert.alert(
      'Reset Statistics',
      'What would you like to reset?',
      resetOptions
    );
  };

  const confirmReset = (type: 'today' | 'all') => {
    const message = type === 'today' 
      ? "Are you sure you want to reset today's statistics? This action cannot be undone."
      : 'Are you sure you want to reset all statistics? This will delete all your progress data and cannot be undone.';

    Alert.alert(
      'Confirm Reset',
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => performReset(type),
        },
      ]
    );
  };

  const performReset = async (type: 'today' | 'all') => {
    try {
      setLoading(true);
      
      if (type === 'today') {
        await StorageService.resetTodayStats();
      } else {
        await StorageService.resetStatistics();
      }
      
      // Refresh timer context stats to update TimerScreen
      await refreshStats();
      
      // Reload statistics after reset
      await loadStatistics();
      
      Alert.alert(
        'Reset Complete',
        type === 'today' 
          ? "Today's statistics have been reset."
          : 'All statistics have been reset.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error resetting statistics:', error);
      Alert.alert(
        'Error',
        'Failed to reset statistics. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateOverview = async (statsData: DailyStats[]) => {
    const totalCycles = statsData.reduce((sum, day) => sum + day.completedCycles, 0);
    const totalFocusTime = statsData.reduce((sum, day) => sum + day.totalFocusTime, 0);
    const totalBreakTime = statsData.reduce((sum, day) => sum + day.totalBreakTime, 0);
    
    // Find best day
    const bestDay = statsData.reduce(
      (best, day) => (day.completedCycles > best.cycles ? 
        { date: day.date, cycles: day.completedCycles } : best),
      { date: '', cycles: 0 }
    );

    // Get current streak
    const streak = await StorageService.getCurrentStreak();

    // Calculate average session length (approximate)
    const averageSessionLength = totalCycles > 0 ? Math.round(totalFocusTime / totalCycles) : 0;

    // Calculate completion rate (simplified - based on days with activity)
    const activeDays = statsData.filter(day => day.completedCycles > 0).length;
    const completionRate = statsData.length > 0 ? Math.round((activeDays / statsData.length) * 100) : 0;

    // Calculate categories breakdown
    const categories = statsData.reduce((acc, day) => ({
      ...acc,
      ...day.categories,
    }), {} as Record<string, number>);

    setOverview({
      totalCycles,
      totalFocusTime,
      totalBreakTime,
      averageSessionLength,
      completionRate,
      streak,
      bestDay,
      categories,
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeRangeTitle = (): string => {
    switch (timeRange) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return 'Statistics';
    }
  };

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string,
    subtitle?: string,
    color: string = colors.primary
  ) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderLeftColor: color, shadowColor: colors.shadow }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={[styles.statSubtitle, { color: colors.muted }]}>{subtitle}</Text>}
    </View>
  );

  const getChartData = () => {
    if (stats.length === 0) return [];

    // Now that we have horizontal scrolling, we can show individual days for all views
    return stats.map(day => ({
      label: timeRange === 'today' ? 'Today' : formatDate(day.date),
      value: day.completedCycles,
      isActive: day.completedCycles > 0,
    }));
  };

  const renderChart = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return null;

    const maxValue = Math.max(...chartData.map(item => item.value), 1);
    // Fixed bar width for consistent appearance
    const barWidth = 55;
    const barSpacing = 16;
    const totalScrollWidth = (barWidth + barSpacing) * chartData.length - barSpacing + (Spacing.lg * 2);

    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Daily Progress</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContent}
          style={styles.chartScroll}
        >
          {chartData.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            const displayValue = item.value > 99 ? '99+' : item.value.toString();
            return (
              <View 
                key={index} 
                style={[
                  styles.barContainer,
                  { 
                    width: barWidth,
                    marginRight: index < chartData.length - 1 ? barSpacing : 0 
                  }
                ]}
              >
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${height}%`,
                        width: 32,
                        backgroundColor: item.isActive ? colors.primary : colors.muted,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.muted }]} numberOfLines={2} ellipsizeMode="tail">
                  {item.label}
                </Text>
                <Text style={[styles.barValue, { color: colors.text }]} numberOfLines={1}>
                  {displayValue}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderFocusVsBreakCard = () => {
    const totalTime = overview.totalFocusTime + overview.totalBreakTime;
    
    if (totalTime === 0) {
      return null;
    }

    const focusPercentage = Math.round((overview.totalFocusTime / totalTime) * 100);
    const breakPercentage = Math.round((overview.totalBreakTime / totalTime) * 100);
    
    // Calculate balance insight
    const getBalanceInsight = () => {
      if (focusPercentage >= 75) {
        return { text: "High focus ratio - consider more breaks", color: colors.accent };
      } else if (focusPercentage >= 65) {
        return { text: "Great focus balance!", color: colors.secondary };
      } else if (focusPercentage >= 50) {
        return { text: "Balanced focus and break time", color: colors.secondary };
      } else {
        return { text: "More focus time recommended", color: colors.primary };
      }
    };

    const balanceInsight = getBalanceInsight();

    return (
      <View style={[styles.focusVsBreakCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <View style={styles.focusVsBreakHeader}>
          <BarChart3 size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.focusVsBreakTitle, { color: colors.text }]}>Focus vs Break Time</Text>
        </View>
        
        <View style={styles.focusVsBreakContent}>
          <View style={styles.timeComparisonRow}>
            <View style={styles.timeComparisonItem}>
              <Text style={[styles.timeComparisonLabel, { color: colors.muted }]}>Focus</Text>
              <Text style={[styles.timeComparisonValue, { color: colors.primary }]}>
                {focusPercentage}%
              </Text>
              <Text style={[styles.timeComparisonTime, { color: colors.muted }]}>
                {formatTime(overview.totalFocusTime)}
              </Text>
            </View>
            
            <View style={[styles.timeComparisonDivider, { backgroundColor: colors.background }]} />
            
            <View style={styles.timeComparisonItem}>
              <Text style={[styles.timeComparisonLabel, { color: colors.muted }]}>Break</Text>
              <Text style={[styles.timeComparisonValue, { color: colors.secondary }]}>
                {breakPercentage}%
              </Text>
              <Text style={[styles.timeComparisonTime, { color: colors.muted }]}>
                {formatTime(overview.totalBreakTime)}
              </Text>
            </View>
          </View>
          
          {/* Visual ratio bar */}
          <View style={styles.ratioBarContainer}>
            <View style={[styles.ratioBar, { backgroundColor: colors.background }]}>
              <View 
                style={[
                  styles.ratioBarFocus, 
                  { 
                    width: `${focusPercentage}%`,
                    backgroundColor: colors.primary
                  }
                ]} 
              />
              <View 
                style={[
                  styles.ratioBarBreak, 
                  { 
                    width: `${breakPercentage}%`,
                    backgroundColor: colors.secondary
                  }
                ]} 
              />
            </View>
          </View>
          
          {/* Balance insight */}
          <View style={styles.balanceInsight}>
            <Text style={[styles.balanceInsightText, { color: balanceInsight.color }]}>
              {balanceInsight.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    const categoryEntries = Object.entries(overview.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Show top 5 categories

    if (categoryEntries.length === 0) {
      return null;
    }

    return (
      <View style={[styles.additionalStats, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
        {categoryEntries.map(([categoryId, sessions]) => {
          const categoryData = PredefinedCategories.find(cat => cat.id === categoryId);
          const percentage = overview.totalCycles > 0 
            ? Math.round((sessions / overview.totalCycles) * 100) 
            : 0;

          return (
            <View key={categoryId} style={[styles.breakdownItem, { borderBottomColor: colors.background }]}>
              <View style={[styles.breakdownIcon, { backgroundColor: colors.background }]}>
                {categoryData && (
                  <View style={[{ width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: categoryData.color }]}>
                    <Text style={{ fontSize: 10 }}>{categoryData.icon}</Text>
                  </View>
                )}
              </View>
              <View style={styles.breakdownContent}>
                <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                  {categoryData?.name || categoryId}
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.text }]}>{sessions} cycles ({percentage}%)</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Statistics</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surface }]} onPress={handleResetStats}>
            <RotateCcw size={18} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surface }]} onPress={onClose}>
            <X size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeSelector}>
        {(['today', 'week', 'month'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              { backgroundColor: colors.surface, shadowColor: colors.shadow },
              timeRange === range && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                { color: colors.text },
                timeRange === range && { color: colors.background },
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.statsGrid}>
                     {renderStatCard(
             <Target size={20} color={colors.primary} strokeWidth={2} />,
             'Cycles',
             overview.totalCycles > 999 ? '999+' : overview.totalCycles.toString(),
             getTimeRangeTitle(),
             colors.primary
           )}
          {renderStatCard(
            <Clock size={20} color={colors.secondary} strokeWidth={2} />,
            'Focus Time',
            formatTime(overview.totalFocusTime),
            `Avg: ${formatTime(overview.averageSessionLength)}`,
            colors.secondary
          )}
          {renderStatCard(
            <TrendingUp size={20} color={colors.accent} strokeWidth={2} />,
            'Completion Rate',
            `${overview.completionRate}%`,
            `${stats.filter(d => d.completedCycles > 0).length} active days`,
            colors.accent
          )}
          {renderStatCard(
            <Award size={20} color="#f39c12" strokeWidth={2} />,
            'Current Streak',
            `${overview.streak} days`,
            overview.bestDay.cycles > 0 ? `Best: ${overview.bestDay.cycles} on ${formatDate(overview.bestDay.date)}` : 'No data yet',
            '#f39c12'
          )}
        </View>

        {/* Focus vs Break Time Comparison */}
        {renderFocusVsBreakCard()}

        {/* Chart */}
        {renderChart()}

        {/* Additional Stats */}
        <View style={[styles.additionalStats, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Insights</Text>
          
          <View style={[styles.breakdownItem, { borderBottomColor: colors.background }]}>
            <View style={[styles.breakdownIcon, { backgroundColor: colors.background }]}>
              <BarChart3 size={16} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.breakdownContent}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Average per Day</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {stats.length > 0 ? Math.min(Math.round(overview.totalCycles / stats.length), 99) : 0} cycles
              </Text>
            </View>
          </View>

          <View style={[styles.breakdownItem, { borderBottomColor: colors.background }]}>
            <View style={[styles.breakdownIcon, { backgroundColor: colors.background }]}>
              <Clock size={16} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.breakdownContent}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Total Session Time</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {formatTime(overview.totalFocusTime + overview.totalBreakTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        {renderCategoryBreakdown()}
      </ScrollView>
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
    // shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeRangeText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  statsGrid: {
    marginBottom: Spacing.xl,
  },
  statCard: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  statTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  statValue: {
    fontSize: Typography.sizes.header,
    fontFamily: Typography.families.black,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
  },
  chartContainer: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: Typography.sizes.header,
    fontFamily: Typography.families.bold,
    marginBottom: Spacing.lg,
  },
  chartScroll: {
    height: 160, // Increased height for better visibility
  },
  chartScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    paddingBottom: 40,
    minHeight: 120,
    flexGrow: 0, // Prevent stretching to fill container
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120, // Fixed height to prevent clipping
  },
  barBackground: {
    height: 80, // Reduced to fit within container
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    width: '100%',
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: Typography.sizes.caption - 1, // Slightly smaller for better fit
    fontFamily: Typography.families.regular,
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 12, // Tighter line height for multi-line labels
  },
  barValue: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.bold,
    textAlign: 'center',
  },
  additionalStats: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: Typography.sizes.header,
    fontFamily: Typography.families.bold,
    marginBottom: Spacing.lg,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  breakdownContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
  },
  breakdownValue: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
  },
  // Focus vs Break Card Styles
  focusVsBreakCard: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  focusVsBreakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  focusVsBreakTitle: {
    fontSize: Typography.sizes.header,
    fontFamily: Typography.families.bold,
    marginLeft: Spacing.sm,
  },
  focusVsBreakContent: {
    gap: Spacing.lg,
  },
  timeComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeComparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeComparisonLabel: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.regular,
    marginBottom: Spacing.xs,
  },
  timeComparisonValue: {
    fontSize: 28,
    fontFamily: Typography.families.black,
    marginBottom: 4,
  },
  timeComparisonTime: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
  },
  timeComparisonDivider: {
    width: 1,
    height: 40,
    marginHorizontal: Spacing.md,
  },
  ratioBarContainer: {
    marginVertical: Spacing.sm,
  },
  ratioBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratioBarFocus: {
    height: '100%',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  ratioBarBreak: {
    height: '100%',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  balanceInsight: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  balanceInsightText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.families.bold,
    textAlign: 'center',
  },
}); 