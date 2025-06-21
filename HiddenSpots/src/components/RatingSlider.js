import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const RatingSlider = ({ label, value, onValueChange, icon }) => {
  const theme = useTheme();
  const ratingColor = value > 3 ? theme.colors.success : value > 1 ? theme.colors.warning : theme.colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Slider
        style={{ width: '100%', height: 40 }}
        value={value}
        onValueChange={onValueChange}
        minimumValue={1}
        maximumValue={5}
        step={1}
        minimumTrackTintColor={ratingColor}
        maximumTrackTintColor={theme.colors.surfaceVariant}
        thumbTintColor={ratingColor}
      />
      <Text style={[styles.valueText, { color: ratingColor }]}>
        {value} / 5
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  valueText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RatingSlider; 