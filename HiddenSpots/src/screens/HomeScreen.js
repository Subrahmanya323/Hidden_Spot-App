import React from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { Text, Button, useTheme, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Hidden Spots!</Text>
      <Text style={styles.subtitle}>Discover, share, and rate secret places around you.</Text>
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          icon="map-marker"
          style={styles.button}
          onPress={() => navigation.navigate('Main', { screen: 'Map' })}
        >
          Discover Map
        </Button>
        <Button
          mode="contained"
          icon="grid"
          style={styles.button}
          onPress={() => navigation.navigate('Main', { screen: 'Feed' })}
        >
          Explore Spots
        </Button>
      </View>
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          icon="plus"
          style={styles.button}
          onPress={() => navigation.navigate('AddSpot')}
        >
          Add Spot
        </Button>
        <Button
          mode="outlined"
          icon="account"
          style={styles.button}
          onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
        >
          Profile
        </Button>
      </View>
      <Card style={styles.featuredCard}>
        <Card.Title title="Featured Categories" />
        <Card.Content>
          <Text style={styles.categoryList}>🌅 Serene   💑 Romantic   🎨 Creative   🍲 Food   🧗 Adventure</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8f6ff',
    minHeight: '100%',
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: 16,
    borderRadius: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C4AB6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  button: {
    marginHorizontal: 6,
    borderRadius: 8,
    minWidth: 140,
  },
  featuredCard: {
    marginTop: 32,
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
  },
  categoryList: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    color: '#6C4AB6',
    fontWeight: '600',
  },
});

export default HomeScreen; 