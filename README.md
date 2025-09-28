# 💕 Choice Love - Soul-Based Matching App

A beautiful love matching application that connects people through shared values, cultural respect, and meaningful choices rather than superficial attributes.

## 🌟 Philosophy

> "Love is not just about who you talk to, but who you understand without speaking."

This app embodies the belief that true love happens when two souls resonate through:
- **Shared Cultural Values** - Respect for elders, family traditions
- **Artistic Compatibility** - Music, art, and creative expression
- **Life Goals Alignment** - Knowledge, happiness, adventure, wealth
- **Philosophical Connection** - Shared thoughts and reflections
- **Lifestyle Harmony** - Communication styles, daily rhythms

## ✨ Features

### 🎨 Beautiful Design
- Divine Krishna and Radha background representing spiritual love
- Glass-morphism UI with smooth animations
- Mobile-responsive design
- Pink gradient theme with cultural significance

### 📝 Comprehensive Compatibility Quiz
- **8 Detailed Categories**: Art, Music, Life Goals, Family Values, Cultural Respect, Travel, Communication, Relationship Goals, Lifestyle
- **Thought Sharing**: Express your inner world through words
- **Cultural Values**: Emphasis on elder respect and family traditions
- **Progress Tracking**: Real-time quiz completion progress

### 💕 Advanced Matching Algorithm
- **Weighted Compatibility**: Cultural values (3x), Family/Culture/Relationship goals (2.5x), Lifestyle (2x), Preferences (1.5x)
- **Soul-Based Scoring**: Goes beyond surface-level matching
- **Thought Analysis**: Keyword similarity for philosophical connection
- **Age Compatibility**: Smart age difference calculations
- **Shared Interests**: Detailed breakdown of common values

### 🌟 Interactive Features
- **Favorites System**: Save matches you connect with
- **Messaging**: Start conversations with matches
- **Detailed Analysis**: Comprehensive compatibility breakdown
- **Profile Management**: Update preferences and information
- **Refine Search**: Adjust criteria for better matches

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone or download the project**
   ```bash
   cd choice-love
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add the background image**
   - Download the Krishna and Radha image
   - Save it as `pngtree-krishna-and-radha-portrait-symbolising-their-love-in-a-beautiful-artistic-image_17579052.webp` in the `public` folder

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
choice-love/
├── public/                    # Frontend files
│   ├── index.html            # Main app page
│   ├── style.css             # Styling and animations
│   ├── script.js             # Frontend JavaScript
│   └── krishna-radha.webp    # Background image
├── server.js                 # Backend API server
├── package.json              # Dependencies and scripts
├── users.json                # User data (auto-created)
├── matches.json              # Match data (auto-created)
└── README.md                 # This file
```

## 🔧 API Endpoints

### Core Endpoints
- `POST /submit` - Submit quiz and get matches
- `GET /user/:id` - Get user profile
- `PUT /user/:id` - Update user profile
- `GET /matches/:userId` - Get matches for user
- `GET /users` - Get all users (public info only)
- `GET /health` - Health check

### Example Usage

**Submit quiz:**
```javascript
fetch('/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John',
    age: 28,
    art: ['Painting', 'Music'],
    cultural_values: ['Elder respect is sacred', 'Family comes first']
  })
})
```

## 🎯 Matching Algorithm

The app uses a sophisticated compatibility system:

1. **Cultural Values** (Weight: 3.0) - Most important for soul connection
2. **Family & Culture** (Weight: 2.5) - Core relationship foundation
3. **Relationship Goals** (Weight: 2.5) - Long-term compatibility
4. **Lifestyle & Communication** (Weight: 2.0) - Daily harmony
5. **Life Goals** (Weight: 2.0) - Aspiration alignment
6. **Art & Music** (Weight: 1.5) - Creative compatibility
7. **Travel Preferences** (Weight: 1.5) - Adventure sharing
8. **Thought Similarity** (Bonus: 1.5) - Philosophical connection
9. **Age Compatibility** (Bonus: 1.0) - Life stage alignment

## 🌈 Cultural Significance

This app honors the beautiful tradition of love through:
- **Divine Inspiration**: Krishna and Radha's eternal love
- **Cultural Respect**: Emphasis on family values and elder respect
- **Soul Connection**: Beyond physical attraction to spiritual harmony
- **Traditional Values**: Modern technology serving timeless principles

## 💖 Philosophy in Action

The app encourages users to:
- Share their deepest thoughts and reflections
- Value cultural traditions and family bonds
- Connect through shared artistic and musical tastes
- Respect elders and cultural heritage
- Find love through meaningful choices, not superficial matching

## 🛠️ Development

### Adding New Features
1. Update the frontend in `public/` folder
2. Add new API endpoints in `server.js`
3. Enhance the matching algorithm as needed
4. Test with `npm run dev`

### Data Storage
- User data: `users.json`
- Match history: `matches.json`
- Automatic file creation and management

## 📱 Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
## Deployed 
https://choice-love-pukmpi1oc-saptami-tithis-projects.vercel.app/
## 🤝 Contributing

This project celebrates the beauty of love through shared values. Contributions that honor this philosophy are welcome!

## 📄 License

MIT License - Feel free to use this for spreading love and cultural respect!

---

*"True love happens when two souls understand each other's values, even without words."* 💕
