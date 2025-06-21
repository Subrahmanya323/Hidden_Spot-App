# Hidden Spots

Discover, share, and rate secret places around you!  
A full-stack mobile app built with **React Native (Expo)** for the frontend and **Node.js/Express + MongoDB** for the backend.

---

## Features

- 🌍 Interactive map to discover hidden spots
- 📝 Add new spots with images, ratings, and stories
- 🗂️ Explore spots in a beautiful grid
- 💬 Comment on spots
- 👤 Profile page (static, ready for future authentication)
- Responsive and mobile-friendly design

---

## Project Structure
HiddenSpots/
- │
- ├── App.js
- ├── app.json
- ├── index.js
- ├── package.json
- ├── package-lock.json
- │
- ├── assets/
- │    ├── adaptive-icon.png
- │    ├── favicon.png
- │    ├── icon.png
- │    └── splash.png
- │
- ├── backend/
- │    ├── config/
- │    │   └── cloudinary.js
- │    ├── env.example
- │    ├── models/
- │    │   ├── Comment.js
- │    │   └── Spot.js
- │    ├── package.json
- │    ├── package-lock.json
- │    ├── routes/
- │    │   ├── comments.js
- │    │   └── spots.js
- │    ├── seed-data.js
- │    └── server.js
- │ 
- └── src/
-    ├── components/
-    │   ├── CustomHeader.js
-    │   ├── CustomTabBar.js
-    │   └── RatingSlider.js
-    ├── constants/
-    │   └── categories.js
-    ├── screens/
-    │   ├── AddSpotScreen.js
-    │   ├── FeedScreen.js
-    │   ├── HomeScreen.js
-    │   ├── MapScreen.js
-    │   ├── ProfileScreen.js
-    │   └── SpotDetailScreen.js
-    └── theme/
         └── theme.js 



---

## Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/yourusername/HiddenSpots.git
cd HiddenSpots
```

### 2. **Install dependencies**

#### Frontend (React Native/Expo)
```bash
npm install
```

#### Backend (Node.js/Express)
```bash
cd backend
npm install
```

### 3. **Setup Environment Variables**

- Copy `backend/env.example` to `backend/.env` and fill in your MongoDB URI and Cloudinary credentials.

### 4. **Seed the Database **

```bash
cd backend
node seed-data.js
```

### 5. **Run the Backend**

```bash
cd backend
node server.js
```

### 6. **Run the Frontend**

```bash
cd ..
npm start
```
- Use Expo Go app or an emulator to view the app.

---

## Configuration

- **MongoDB Atlas**: Used for persistent data storage.
- **Cloudinary**: Used for image uploads.

---

