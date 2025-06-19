import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';

import { TimerScreen } from './TimerScreen';
import { SettingsScreen } from './SettingsScreen';
import { StatisticsScreen } from './StatisticsScreen';
import { useTimer } from '../contexts/TimerContext';
import { useTheme } from '../contexts/ThemeContext';

export function MainScreen() {
  const { colors, isDark } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const { settings, updateSettings } = useTimer();

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleOpenStatistics = () => {
    setShowStatistics(true);
  };

  const handleCloseStatistics = () => {
    setShowStatistics(false);
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    updateSettings(newSettings);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      
      {showSettings ? (
        <SettingsScreen
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={handleCloseSettings}
        />
      ) : showStatistics ? (
        <StatisticsScreen onClose={handleCloseStatistics} />
      ) : (
        <TimerScreen 
          onOpenSettings={handleOpenSettings}
          onOpenStatistics={handleOpenStatistics}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 