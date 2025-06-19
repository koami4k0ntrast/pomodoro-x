import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Typography, Spacing } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface DurationPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix: string;
}

export function DurationPicker({ value, onChange, min, max, suffix }: DurationPickerProps) {
  const { colors } = useTheme();
  
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: value <= min ? colors.muted + '30' : colors.primary }
        ]}
        onPress={handleDecrement}
        disabled={value <= min}
      >
        <Minus 
          size={16} 
          color={value <= min ? colors.muted : colors.white} 
          strokeWidth={2} 
        />
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.suffix, { color: colors.muted }]}>{suffix}</Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: value >= max ? colors.muted + '30' : colors.primary }
        ]}
        onPress={handleIncrement}
        disabled={value >= max}
      >
        <Plus 
          size={16} 
          color={value >= max ? colors.muted : colors.white} 
          strokeWidth={2} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'transparent',
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 60,
    paddingHorizontal: Spacing.md,
  },
  value: {
    fontSize: Typography.sizes.body + 2,
    fontFamily: Typography.families.black,
  },
  suffix: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    marginTop: -2,
  },
}); 