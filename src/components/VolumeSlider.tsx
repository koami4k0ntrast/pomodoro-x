import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VolumeX, Volume1, Volume2, Volume } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../constants';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  const handleDecrease = () => {
    const newValue = Math.max(0, value - 10);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(100, value + 10);
    onChange(newValue);
  };

  const getVolumeIcon = () => {
    if (value === 0) return <VolumeX size={16} color={Colors.muted} strokeWidth={2} />;
    if (value < 30) return <Volume size={16} color={Colors.text} strokeWidth={2} />;
    if (value < 70) return <Volume1 size={16} color={Colors.text} strokeWidth={2} />;
    return <Volume2 size={16} color={Colors.text} strokeWidth={2} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.volumeIconContainer}>
        {getVolumeIcon()}
      </View>
      
      <TouchableOpacity
        style={[styles.button, value <= 0 && styles.buttonDisabled]}
        onPress={handleDecrease}
        disabled={value <= 0}
      >
        <Text style={[styles.buttonText, value <= 0 && styles.buttonTextDisabled]}>−</Text>
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{Math.round(value)}%</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, value >= 100 && styles.buttonDisabled]}
        onPress={handleIncrease}
        disabled={value >= 100}
      >
        <Text style={[styles.buttonText, value >= 100 && styles.buttonTextDisabled]}>+</Text>
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
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.muted + '30',
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.muted + '30',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Typography.families.bold,
    color: Colors.white,
    lineHeight: 18,
  },
  buttonTextDisabled: {
    color: Colors.muted,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  valueText: {
    fontSize: Typography.sizes.caption + 1,
    fontFamily: Typography.families.bold,
    color: Colors.text,
  },
}); 