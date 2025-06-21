import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Button, Card, Text, Chip, useTheme, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { CATEGORY_LIST, getCategoryConfig } from '../constants/categories';

const API_URL = 'http://localhost:5000/api/spots';

const CARD_MARGIN = 8;
const CARD_WIDTH = (Dimensions.get('window').width / 2) - (CARD_MARGIN * 3);

const FeedScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: [], minVibe: 0 });
  const [sortBy, setSortBy] = useState('createdAt:desc');

  const fetchSpots = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        'filter[category]': filters.category.join(','),
        'filter[minVibe]': filters.minVibe,
        sort: sortBy,
      };
      
      const response = await axios.get(API_URL, { params });
      setSpots(response.data.spots || response.data);

    } catch (error) {
      console.error("Failed to fetch spots:", error);
      // Fallback to nearby spots if filtering fails
      try {
        const response = await axios.get('http://localhost:5000/api/spots/nearby');
        setSpots(response.data);
      } catch (fallbackError) {
        console.error("Failed to fetch nearby spots:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // Refresh data when screen comes into focus (e.g., after adding a spot)
  useFocusEffect(
    useCallback(() => {
      fetchSpots();
    }, [fetchSpots])
  );

  const handleCategoryToggle = (cat) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter(c => c !== cat)
        : [...prev.category, cat],
    }));
  };
  
  const renderSpotCard = ({ item }) => {
    const categoryConfig = getCategoryConfig(item.category);
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SpotDetail', { spotId: item._id })}>
        <Card style={styles.card}>
          <Card.Cover source={{ uri: item.images[0] || 'https://picsum.photos/700' }} style={styles.cardImage} />
          <Card.Title 
            title={item.name} 
            subtitle={`Vibe: ${item.avgRatings.vibe} ⭐`}
            right={() => <Chip style={{backgroundColor: categoryConfig.color, marginRight: 8}} textStyle={{color: '#fff'}}>{item.category}</Chip>}
          />
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Categories</Text>
        <View style={styles.chipContainer}>
            {CATEGORY_LIST.map(cat => (
                <Chip 
                    key={cat} 
                    selected={filters.category.includes(cat)}
                    onPress={() => handleCategoryToggle(cat)}
                    style={[styles.chip, { backgroundColor: filters.category.includes(cat) ? getCategoryConfig(cat).color : theme.colors.surfaceVariant }]}
                >
                    {cat}
                </Chip>
            ))}
        </View>
        <SegmentedButtons
            value={sortBy}
            onValueChange={setSortBy}
            buttons={[
                { value: 'createdAt:desc', label: 'Newest' },
                { value: 'avgRatings.vibe:desc', label: 'Best Vibe' },
                { value: 'avgRatings.uniqueness:desc', label: 'Most Unique' },
            ]}
            style={{marginTop: 10}}
        />
      </View>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      ) : (
        <FlatList
          data={spots}
          renderItem={renderSpotCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          numColumns={2}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 4,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    height: 40,
    marginBottom: 6,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 80, // for tab bar
  },
  card: {
    margin: CARD_MARGIN,
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardImage: {
    aspectRatio: 1.2,
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
});

export default FeedScreen; 