import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, useTheme } from '@react-navigation/native';
import { Card, Chip, Title, Paragraph, TextInput, Button } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import axios from 'axios';
import { getCategoryConfig } from '../constants/categories';

const API_URL = 'http://localhost:5000/api';

const StoryTab = ({ story }) => (
  <View style={styles.tabContainer}>
    <Paragraph style={styles.storyText}>{story}</Paragraph>
  </View>
);

const GalleryTab = ({ images }) => (
  <ScrollView contentContainerStyle={styles.galleryContainer}>
    {images.map((img, index) => (
      <Image key={index} source={{ uri: img }} style={styles.galleryImage} />
    ))}
  </ScrollView>
);

const CommentsTab = ({ spotId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/spots/${spotId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, [spotId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);
    
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const response = await axios.post(`${API_URL}/spots/${spotId}/comments`, {
                text: newComment,
                isAnonymous: false,
                username: 'WebAppUser'
            });
            setComments(prev => [...prev, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.tabContainer}>
            <FlatList
                data={comments}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <Card style={styles.commentCard}>
                        <Card.Content>
                            <Text style={styles.commentUser}>
                                {item.isAnonymous ? 'Anonymous' : (item.username || 'Unknown User')}
                            </Text>
                            <Paragraph>{item.text}</Paragraph>
                            <Text style={styles.commentDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                        </Card.Content>
                    </Card>
                )}
                ListHeaderComponent={
                    <View>
                        <TextInput
                            label="Add your comment"
                            value={newComment}
                            onChangeText={setNewComment}
                            mode="outlined"
                            style={{ marginBottom: 10 }}
                        />
                        <Button mode="contained" onPress={handleAddComment} loading={submitting} disabled={submitting}>
                            Post Comment
                        </Button>
                    </View>
                }
            />
        </View>
    );
};

const SpotDetailScreen = () => {
  const route = useRoute();
  const theme = useTheme();
  const { spotId } = route.params;

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'story', title: 'Story' },
    { key: 'gallery', title: 'Gallery' },
    { key: 'tips', title: 'Tips' },
    { key: 'comments', title: 'Comments' },
  ]);

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const response = await axios.get(`${API_URL}/spots/${spotId}`);
        setSpot(response.data);
      } catch (error) {
        console.error("Failed to fetch spot details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpot();
  }, [spotId]);

  const renderScene = SceneMap({
    story: () => <StoryTab story={spot?.story || ''} />,
    gallery: () => <GalleryTab images={spot?.images || []} />,
    tips: () => <View style={styles.tabContainer}><Text>Tips will be here.</Text></View>,
    comments: () => <CommentsTab spotId={spotId} />,
  });

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (!spot) {
    return <View style={styles.centered}><Text>Spot not found.</Text></View>;
  }

  const categoryConfig = getCategoryConfig(spot.category);

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: spot.images[0] || 'https://picsum.photos/700' }} />
        <Card.Content style={styles.header}>
          <Title style={styles.spotName}>{spot.name}</Title>
          <Chip icon={categoryConfig.icon} style={{ backgroundColor: categoryConfig.color }}>
            <Text style={{ color: '#fff' }}>{spot.category}</Text>
          </Chip>
        </Card.Content>
      </Card>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={props => 
            <TabBar 
                {...props} 
                style={{ backgroundColor: theme.colors.surface }}
                indicatorStyle={{ backgroundColor: theme.colors.primary }}
                labelStyle={{ color: theme.colors.text, fontWeight: 'bold' }}
            />
        }
      />
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 16,
  },
  spotName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tabContainer: {
    padding: 16,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'serif',
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 4,
  },
  galleryImage: {
    width: width / 2 - 8,
    height: width / 2 - 8,
    margin: 2,
    borderRadius: 8,
  },
  commentCard: {
      marginVertical: 5,
  },
  commentUser: {
      fontWeight: 'bold',
  },
  commentDate: {
      fontSize: 12,
      color: '#888',
      marginTop: 5,
  }
});

export default SpotDetailScreen; 