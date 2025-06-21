const mongoose = require('mongoose');
const Spot = require('./models/Spot');
const Comment = require('./models/Comment');
require('dotenv').config();

// Sample spots data for Gwalior
const sampleSpots = [
  {
    name: "Sunset Point at Gwalior Fort",
    coordinates: {
      type: 'Point',
      coordinates: [78.1648, 26.2183] // Gwalior Fort coordinates
    },
    category: 'Romantic',
    story: "A magical spot at the top of Gwalior Fort where you can watch the most breathtaking sunsets. The golden hour here is absolutely romantic - perfect for couples. The view of the entire city bathed in golden light is unforgettable.",
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
    ],
    ratings: {
      vibe: [5, 4, 5, 4, 5],
      safety: [4, 5, 4, 4, 5],
      uniqueness: [5, 5, 4, 5, 4],
      crowd: [3, 2, 3, 2, 3]
    },
    creatorInfo: {
      isAnonymous: false,
      username: "SunsetLover"
    }
  },
  {
    name: "Hidden Garden near Jai Vilas Palace",
    coordinates: {
      type: 'Point',
      coordinates: [78.1589, 26.2156] // Near Jai Vilas Palace
    },
    category: 'Serene',
    story: "A peaceful garden hidden behind the grand Jai Vilas Palace. This is my secret escape from the city noise. The ancient trees provide perfect shade, and the sound of birds is therapeutic. Great place to read a book or meditate.",
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    ratings: {
      vibe: [4, 5, 4, 4, 5],
      safety: [5, 4, 5, 5, 4],
      uniqueness: [4, 4, 5, 4, 4],
      crowd: [2, 1, 2, 2, 1]
    },
    creatorInfo: {
      isAnonymous: true,
      username: null
    }
  },
  {
    name: "Street Art Corner in Old City",
    coordinates: {
      type: 'Point',
      coordinates: [78.1620, 26.2200] // Old city area
    },
    category: 'Creative',
    story: "An amazing corner in the old city where local artists have created beautiful murals. The colors and creativity here are inspiring. Perfect spot for photographers and artists looking for inspiration. The community here is so welcoming!",
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    ],
    ratings: {
      vibe: [5, 4, 5, 5, 4],
      safety: [4, 4, 3, 4, 4],
      uniqueness: [5, 5, 5, 5, 5],
      crowd: [3, 4, 3, 3, 4]
    },
    creatorInfo: {
      isAnonymous: false,
      username: "ArtExplorer"
    }
  },
  {
    name: "Secret Rooftop Cafe",
    coordinates: {
      type: 'Point',
      coordinates: [78.1600, 26.2180] // City center area
    },
    category: 'Food',
    story: "A hidden rooftop cafe that serves the most amazing local food. The view from here is spectacular, and the food is authentic Gwalior cuisine. Not many people know about this place, so it's always peaceful. Their chai and samosas are a must-try!",
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop'
    ],
    ratings: {
      vibe: [4, 5, 4, 4, 5],
      safety: [5, 4, 5, 5, 4],
      uniqueness: [4, 5, 4, 4, 5],
      crowd: [3, 2, 3, 3, 2]
    },
    creatorInfo: {
      isAnonymous: false,
      username: "FoodieGwalior"
    }
  },
  {
    name: "Adventure Trail near Tansen Tomb",
    coordinates: {
      type: 'Point',
      coordinates: [78.1650, 26.2170] // Near Tansen Tomb
    },
    category: 'Adventure',
    story: "An exciting hiking trail near Tansen Tomb that leads to a hidden viewpoint. The trail is challenging but rewarding. You'll discover ancient ruins and get amazing panoramic views of the city. Perfect for adventure seekers!",
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    ratings: {
      vibe: [5, 4, 5, 5, 4],
      safety: [4, 3, 4, 4, 3],
      uniqueness: [5, 5, 4, 5, 5],
      crowd: [2, 1, 2, 2, 1]
    },
    creatorInfo: {
      isAnonymous: false,
      username: "AdventureSeeker"
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB Atlas
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Clear existing data
    await Spot.deleteMany({});
    await Comment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample spots
    const createdSpots = await Spot.insertMany(sampleSpots);
    console.log(`✅ Inserted ${createdSpots.length} spots`);

    // Create sample comments
    const sampleComments = [
      {
        spotId: createdSpots[0]._id,
        text: "Absolutely stunning sunset views! Perfect for a romantic evening.",
        isAnonymous: false,
        username: "RomanceSeeker"
      },
      {
        spotId: createdSpots[0]._id,
        text: "Best spot in Gwalior for photography. The golden hour is magical!",
        isAnonymous: true
      },
      {
        spotId: createdSpots[1]._id,
        text: "So peaceful and quiet. Perfect escape from the city hustle.",
        isAnonymous: false,
        username: "PeaceLover"
      },
      {
        spotId: createdSpots[2]._id,
        text: "The street art here is incredible! Each mural tells a story.",
        isAnonymous: false,
        username: "ArtEnthusiast"
      },
      {
        spotId: createdSpots[3]._id,
        text: "Amazing food and even better views! Highly recommended.",
        isAnonymous: false,
        username: "FoodExplorer"
      }
    ];

    await Comment.insertMany(sampleComments);
    console.log(`✅ Inserted ${sampleComments.length} comments`);

    // Display created spots
    console.log('\n📍 Created Spots:');
    createdSpots.forEach(spot => {
      console.log(`- ${spot.name} (${spot.category}) at [${spot.coordinates.coordinates[1]}, ${spot.coordinates.coordinates[0]}]`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 