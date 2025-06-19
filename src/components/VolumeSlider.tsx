import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VolumeX, Volume1, Volume2, Volume } from 'lucide-react-native';
import { Typography, Spacing } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  const { colors } = useTheme();
  
  const handleDecrease = () => {
    const newValue = Math.max(0, value - 10);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(100, value + 10);
    onChange(newValue);
  };

  const getVolumeIcon = () => {
    if (value === 0) return <VolumeX size={16} color={colors.muted} strokeWidth={2} />;
    if (value < 30) return <Volume size={16} color={colors.text} strokeWidth={2} />;
    if (value < 70) return <Volume1 size={16} color={colors.text} strokeWidth={2} />;
    return <Volume2 size={16} color={colors.text} strokeWidth={2} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.volumeIconContainer}>
        {getVolumeIcon()}
      </View>
      
      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: value <= 0 ? colors.muted + '30' : colors.primary }
        ]}
        onPress={handleDecrease}
        disabled={value <= 0}
      >
        <Text style={[
          styles.buttonText, 
          { color: value <= 0 ? colors.muted : colors.white }
        ]}>−</Text>
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: colors.text }]}>{Math.round(value)}%</Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: value >= 100 ? colors.muted + '30' : colors.primary }
        ]}
        onPress={handleIncrease}
        disabled={value >= 100}
      >
        <Text style={[
          styles.buttonText, 
          { color: value >= 100 ? colors.muted : colors.white }
        ]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  volumeIconContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Typography.families.bold,
    lineHeight: 18,
  },
  buttonTextDisabled: {
    color: 'transparent',
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  valueText: {
    fontSize: Typography.sizes.caption + 1,
    fontFamily: Typography.families.bold,
  },
}); 