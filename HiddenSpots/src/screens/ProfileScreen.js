import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Card, Button, Divider } from 'react-native-paper';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://api.dicebear.com/7.x/personas/svg?seed=User' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>WebAppUser</Text>
        <Text style={styles.bio}>Adventurer | Explorer | Hidden Spots Enthusiast</Text>
        <Button mode="outlined" style={styles.editButton} icon="pencil">Edit Profile</Button>
      </View>
      <Card style={styles.sectionCard}>
        <Card.Title title="My Spots" left={(props) => <Text style={styles.sectionIcon}>📍</Text>} />
        <Card.Content>
          <Text style={styles.emptyText}>You haven't added any spots yet.</Text>
        </Card.Content>
      </Card>
      <Card style={styles.sectionCard}>
        <Card.Title title="My Comments" left={(props) => <Text style={styles.sectionIcon}>💬</Text>} />
        <Card.Content>
          <Text style={styles.emptyText}>You haven't commented on any spots yet.</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f8f6ff',
    minHeight: '100%',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: width * 0.14,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C4AB6',
    marginBottom: 4,
  },
  bio: {
    fontSize: 15,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  editButton: {
    marginTop: 4,
    borderRadius: 8,
    borderColor: '#6C4AB6',
  },
  sectionCard: {
    width: width * 0.92,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    alignSelf: 'center',
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 12,
  },
});

export default ProfileScreen; 