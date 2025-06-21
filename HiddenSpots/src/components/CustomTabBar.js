import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;
        const iconName = options.tabBarIcon || 'circle';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tab, isFocused && styles.tabFocused]}
          >
            <MaterialCommunityIcons name={iconName} size={28} color={isFocused ? '#8B7EC8' : '#888'} />
            <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabFocused: {
    backgroundColor: '#F4F0FF',
    borderRadius: 16,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  labelFocused: {
    color: '#8B7EC8',
    fontWeight: 'bold',
  },
});

export default CustomTabBar; 