import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Button, Text, TextInput, Switch, Chip, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { CATEGORY_LIST, getCategoryConfig } from '../constants/categories';
import RatingSlider from '../components/RatingSlider';

// A simplified map snapshot for the web view
const WebMapSnapshot = ({ location }) => (
  <View style={styles.webMapSnapshot}>
    <MaterialCommunityIcons name="map-marker" size={48} color="#F44336" />
    {location ? (
      <Text style={styles.webMapText}>
        Location Captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
      </Text>
    ) : (
      <Text style={styles.webMapText}>Getting location...</Text>
    )}
  </View>
);

const AddSpotScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const [name, setName] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState(CATEGORY_LIST[0]);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [ratings, setRatings] = useState({ vibe: 3, safety: 3, uniqueness: 3, crowd: 3 });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to add a spot.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduced quality for faster uploads
      base64: true, // Needed to send to backend
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const handleRatingChange = (field, value) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!name || !story || !location) {
        Alert.alert('Missing Information', 'Please fill out the spot name, story, and ensure location is enabled.');
        return;
    }
    setLoading(true);
    try {
        const imageBase64Strings = images.map(img => `data:image/jpeg;base64,${img.base64}`);
        const spotData = {
            name,
            story,
            category,
            coordinates: [location.longitude, location.latitude],
            ratings,
            creatorInfo: { isAnonymous, username: 'WebAppUser' }, // Placeholder for username
            images: imageBase64Strings,
        };

        // Send data to backend
        const response = await axios.post('http://localhost:5000/api/spots', spotData);
        console.log("Spot created:", response.data);

        Alert.alert('Success', 'Your hidden spot has been added!');
        navigation.goBack();

    } catch (error) {
        console.error('Submission Error:', error);
        Alert.alert('Error', 'Could not submit your spot. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Title title="Location" subtitle="Your current location will be used" />
        <Card.Content>
          {Platform.OS === 'web' ? (
            <WebMapSnapshot location={location} />
          ) : (
            <Text>Map placeholder for mobile</Text> // Placeholder for mobile map view
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Spot Details" />
        <Card.Content>
          <TextInput
            label="Spot Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Your Personal Story"
            value={story}
            onChangeText={setStory}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Category" />
        <Card.Content style={styles.chipContainer}>
          {CATEGORY_LIST.map(cat => (
            <Chip
              key={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, { backgroundColor: category === cat ? getCategoryConfig(cat).color : theme.colors.surfaceVariant }]}
              textStyle={{ color: category === cat ? '#fff' : theme.colors.text }}
            >
              {cat}
            </Chip>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Upload Photos" />
        <Card.Content>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <MaterialCommunityIcons name="camera-plus" size={24} color={theme.colors.primary} />
                <Text style={{color: theme.colors.primary, marginLeft: 8}}>Add a Photo</Text>
            </TouchableOpacity>
            <View style={styles.imagePreviewContainer}>
                {images.map((img, index) => (
                    <Image key={index} source={{ uri: img.uri }} style={styles.thumbnail} />
                ))}
            </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Rate Your Spot" />
        <Card.Content>
          <RatingSlider
            label="Vibe"
            icon="star-circle"
            value={ratings.vibe}
            onValueChange={value => handleRatingChange('vibe', value)}
          />
          <RatingSlider
            label="Safety"
            icon="shield-check"
            value={ratings.safety}
            onValueChange={value => handleRatingChange('safety', value)}
          />
          <RatingSlider
            label="Uniqueness"
            icon="lightbulb-on"
            value={ratings.uniqueness}
            onValueChange={value => handleRatingChange('uniqueness', value)}
          />
          <RatingSlider
            label="Crowd Level"
            icon="account-group"
            value={ratings.crowd}
            onValueChange={value => handleRatingChange('crowd', value)}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.anonymousRow}>
            <Text>Post Anonymously?</Text>
            <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Hidden Spot'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 40,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  imagePreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
  },
  thumbnail: {
      width: 80,
      height: 80,
      borderRadius: 8,
      margin: 4,
  },
  anonymousRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  webMapSnapshot: {
    height: 150,
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webMapText: {
      marginTop: 8,
      color: '#666',
      fontWeight: 'bold',
  }
});

export default AddSpotScreen; 