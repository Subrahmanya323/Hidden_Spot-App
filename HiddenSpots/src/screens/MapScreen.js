import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, Text } from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getMarkerColor, getCategoryEmoji } from '../constants/categories';

// Only import react-native-maps for mobile platforms
let MapView, Marker, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

const BACKEND_URL = 'http://localhost:5000/api/spots/nearby';

const MapScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchSpots(location.latitude, location.longitude);
    }
  }, [location]);

  // Refresh spots when screen comes into focus (e.g., after adding a spot)
  useFocusEffect(
    useCallback(() => {
      if (location) {
        fetchSpots(location.latitude, location.longitude);
      }
    }, [location])
  );

  const fetchSpots = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await axios.get(BACKEND_URL, {
        params: { lat, lng, radius: 500 },
      });
      setSpots(res.data);
    } catch (err) {
      console.error('Error fetching spots:', err);
      setErrorMsg('Failed to fetch spots');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B7EC8" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddSpot')} style={styles.fab}>
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // Web version - show placeholder with spots list
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webMapContainer}>
          <View style={styles.webMapHeader}>
            <MaterialCommunityIcons name="map" size={32} color="#8B7EC8" />
            <Text style={styles.webMapTitle}>Hidden Spots Map</Text>
          </View>
          
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 Your Location: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Loading...'}
            </Text>
          </View>

          <View style={styles.spotsList}>
            <Text style={styles.spotsTitle}>Nearby Spots ({spots.length})</Text>
            {spots.length === 0 ? (
              <View style={styles.noSpots}>
                <MaterialCommunityIcons name="map-marker-off" size={48} color="#ccc" />
                <Text style={styles.noSpotsText}>No hidden spots nearby yet</Text>
                <Text style={styles.noSpotsSubtext}>Be the first to add one!</Text>
              </View>
            ) : (
              spots.map((spot) => (
                <TouchableOpacity
                  key={spot._id}
                  style={styles.spotCard}
                  onPress={() => navigation.navigate('SpotDetail', { spotId: spot._id })}
                >
                  <View style={styles.spotHeader}>
                    <Text style={styles.spotName}>{spot.name}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getMarkerColor(spot.category) }]}>
                      <Text style={styles.categoryText}>{getCategoryEmoji(spot.category)} {spot.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.spotDescription} numberOfLines={2}>
                    {spot.story}
                  </Text>
                  <View style={styles.spotRating}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {spot.avgRatings?.vibe || 0} Vibe Rating
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
        
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddSpot')}
          accessibilityLabel="Add Hidden Spot"
        >
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // Mobile version - use react-native-maps
  return (
    <View style={styles.container}>
      {location && MapView && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          {spots.map((spot) => (
            <Marker
              key={spot._id}
              coordinate={{
                latitude: spot.coordinates.coordinates[1],
                longitude: spot.coordinates.coordinates[0],
              }}
              pinColor={getMarkerColor(spot.category)}
              title={spot.name}
              description={spot.category}
            >
              <View style={styles.markerIcon}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={36}
                  color={getMarkerColor(spot.category)}
                />
                <View style={styles.emojiBubble}>
                  <Text style={{ fontSize: 16 }}>{getCategoryEmoji(spot.category)}</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>
      )}
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddSpot')}
        accessibilityLabel="Add Hidden Spot"
      >
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B7EC8',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#8B7EC8',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  markerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBubble: {
    position: 'absolute',
    top: 6,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 1,
    elevation: 2,
  },
  // Web-specific styles
  webMapContainer: {
    flex: 1,
    padding: 16,
  },
  webMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  webMapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B7EC8',
    marginLeft: 12,
  },
  locationInfo: {
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  spotsList: {
    flex: 1,
  },
  spotsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  noSpots: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  noSpotsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  noSpotsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  spotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  spotDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  spotRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default MapScreen; 