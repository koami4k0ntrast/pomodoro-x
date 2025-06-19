import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../constants';

interface DurationPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix: string;
}

export function DurationPicker({ value, onChange, min, max, suffix }: DurationPickerProps) {
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
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value <= min && styles.buttonDisabled]}
        onPress={handleDecrement}
        disabled={value <= min}
      >
        <Minus 
          size={16} 
          color={value <= min ? Colors.muted : Colors.white} 
          strokeWidth={2} 
        />
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, value >= max && styles.buttonDisabled]}
        onPress={handleIncrement}
        disabled={value >= max}
      >
        <Plus 
          size={16} 
          color={value >= max ? Colors.muted : Colors.white} 
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
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.muted + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.muted + '30',
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 60,
    paddingHorizontal: Spacing.md,
  },
  value: {
    fontSize: Typography.sizes.body + 2,
    fontFamily: Typography.families.black,
    color: Colors.text,
  },
  suffix: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.families.regular,
    color: Colors.muted,
    marginTop: -2,
  },
}); 