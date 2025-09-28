const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data storage files
const USERS_FILE = 'users.json';
const MATCHES_FILE = 'matches.json';
const MESSAGES_FILE = 'messages.json';

// Email configuration
const EMAIL_CONFIG = {
  // For development, you can use Gmail or any SMTP service
  // For production, consider using SendGrid, Mailgun, or AWS SES
  service: 'gmail', // Change this to your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Set this in environment variables
    pass: process.env.EMAIL_PASS || 'your-app-password' // Use app password for Gmail
  }
};

// Create email transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Initialize data files if they don't exist
async function initializeDataFiles() {
  try {
    // Check if users.json exists, if not create it
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
      console.log('✅ Created users.json');
    }

    // Check if matches.json exists, if not create it
    try {
      await fs.access(MATCHES_FILE);
    } catch {
      await fs.writeFile(MATCHES_FILE, JSON.stringify([], null, 2));
      console.log('✅ Created matches.json');
    }

    // Check if messages.json exists, if not create it
    try {
      await fs.access(MESSAGES_FILE);
    } catch {
      await fs.writeFile(MESSAGES_FILE, JSON.stringify([], null, 2));
      console.log('✅ Created messages.json');
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Read data from JSON files
async function readData(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Write data to JSON files
async function writeData(filename, data) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Send email notification for new matches
async function sendMatchNotification(userEmail, userName, newMatches) {
  try {
    if (!userEmail || !EMAIL_CONFIG.auth.user || EMAIL_CONFIG.auth.user === 'your-email@gmail.com') {
      console.log('📧 Email notifications not configured - skipping email send');
      return false;
    }

    const matchList = newMatches.map((match, index) => `
      <div style="background: rgba(255, 107, 157, 0.1); padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #ff6b9d;">
        <h3 style="color: #ff6b9d; margin: 0 0 10px 0;">Match #${index + 1} - ${match.compatibility}% Compatibility</h3>
        <p style="margin: 5px 0; color: #333;"><strong>User ID:</strong> ${match.userId}</p>
        <p style="margin: 5px 0; color: #333;"><strong>Compatibility:</strong> ${getCompatibilityMessage(match.compatibility)}</p>
        ${match.sharedInterests ? `<p style="margin: 5px 0; color: #333;"><strong>Shared Interests:</strong> ${match.sharedInterests.join(', ')}</p>` : ''}
        ${match.thoughts ? `<p style="margin: 5px 0; color: #333;"><strong>Their Thoughts:</strong> "${match.thoughts.substring(0, 150)}${match.thoughts.length > 150 ? '...' : ''}"</p>` : ''}
      </div>
    `).join('');

    const mailOptions = {
      from: `"Choice Love" <${EMAIL_CONFIG.auth.user}>`,
      to: userEmail,
      subject: `💕 New Soul Matches Found! - ${newMatches.length} ${newMatches.length === 1 ? 'Match' : 'Matches'}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #460d22 0%, #7a2c4a 100%); color: white; padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6b9d; font-size: 2rem; margin: 0;">💚 Choice Love</h1>
            <p style="font-style: italic; margin: 10px 0;">"Love is not just about who you talk to, but who you understand without speaking."</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 20px; margin-bottom: 20px;">
            <h2 style="color: #fff; margin: 0 0 15px 0;">🎉 Great News, ${userName || 'Soul Seeker'}!</h2>
            <p style="margin: 0 0 20px 0; font-size: 1.1rem;">Someone new has joined Choice Love and matches with your soul! Here are your new matches:</p>
            
            ${matchList}
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.APP_URL || 'http://localhost:3001'}" style="background: linear-gradient(45deg, #ff6b9d, #ff8fab); color: white; padding: 15px 30px; text-decoration: none; border-radius: 15px; font-weight: bold; display: inline-block;">💕 View All Matches</a>
            </div>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">💡 <strong>Tip:</strong> The more people who join Choice Love, the better your matches will be! Share the app with friends who value meaningful connections.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 0.8rem; opacity: 0.7;">
            <p>This email was sent because you signed up for match notifications on Choice Love.</p>
            <p>If you no longer wish to receive these emails, please contact us.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Match notification email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('📧 Error sending match notification email:', error);
    return false;
  }
}

// Helper function for compatibility messages
function getCompatibilityMessage(score) {
  if (score >= 90) return "Perfect soul connection! ✨";
  if (score >= 80) return "Excellent match! 🌟";
  if (score >= 70) return "Great potential! 💕";
  if (score >= 60) return "Good compatibility! 💖";
  if (score >= 40) return "Interesting match! 💫";
  return "Unique connection! 🌈";
}

// Send email notification for new messages
async function sendMessageNotification(userEmail, userName, senderName, message) {
  try {
    if (!userEmail || !EMAIL_CONFIG.auth.user || EMAIL_CONFIG.auth.user === 'your-email@gmail.com') {
      console.log('📧 Email notifications not configured - skipping message email');
      return false;
    }

    const mailOptions = {
      from: `"Choice Love" <${EMAIL_CONFIG.auth.user}>`,
      to: userEmail,
      subject: `💌 New Message from ${senderName} on Choice Love`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #460d22 0%, #7a2c4a 100%); color: white; padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6b9d; font-size: 2rem; margin: 0;">💚 Choice Love</h1>
            <p style="font-style: italic; margin: 10px 0;">"Love is not just about who you talk to, but who you understand without speaking."</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 20px; margin-bottom: 20px;">
            <h2 style="color: #fff; margin: 0 0 15px 0;">💌 New Message, ${userName || 'Soul Seeker'}!</h2>
            <p style="margin: 0 0 20px 0; font-size: 1.1rem;">You received a message from <strong>${senderName}</strong>:</p>
            
            <div style="background: rgba(255, 107, 157, 0.2); padding: 20px; border-radius: 15px; border-left: 4px solid #ff6b9d; margin: 20px 0;">
              <p style="margin: 0; font-size: 1.1rem; font-style: italic; color: #fff;">"${message}"</p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.APP_URL || 'http://localhost:3001'}" style="background: linear-gradient(45deg, #ff6b9d, #ff8fab); color: white; padding: 15px 30px; text-decoration: none; border-radius: 15px; font-weight: bold; display: inline-block;">💬 Reply to Message</a>
            </div>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">💡 <strong>Tip:</strong> Respond to keep the conversation flowing! Your soul connection is waiting to hear from you.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 0.8rem; opacity: 0.7;">
            <p>This email was sent because you received a message on Choice Love.</p>
            <p>If you no longer wish to receive these emails, please contact us.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Message notification email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('📧 Error sending message notification email:', error);
    return false;
  }
}

// Advanced matching algorithm based on soul compatibility
async function findMatches(currentUser, allUsers) {
  const matches = [];
  
  for (const user of allUsers) {
    // Don't match with yourself
    if (user.id === currentUser.id) continue;
    
    const compatibility = calculateCompatibility(currentUser, user);
    
    // Only include matches with reasonable compatibility
    if (compatibility >= 40) {
      const sharedInterests = findSharedInterests(currentUser, user);
      
      matches.push({
        userId: user.id,
        name: user.name || 'Anonymous',
        age: user.age || 'Not specified',
        location: user.location || 'Not specified',
        compatibility: Math.round(compatibility),
        sharedInterests: sharedInterests,
        thoughts: user.thoughts || '',
        culturalValues: user.cultural_values || []
      });
    }
  }
  
  // Sort by compatibility (highest first)
  matches.sort((a, b) => b.compatibility - a.compatibility);
  
  // Return top 10 matches
  return matches.slice(0, 10);
}

// Find users who match with the new user and send notifications
async function notifyExistingUsersOfNewMatch(newUser, allUsers) {
  try {
    const notificationsToSend = [];
    
    for (const existingUser of allUsers) {
      // Don't notify the new user themselves
      if (existingUser.id === newUser.id) continue;
      
      const compatibility = calculateCompatibility(existingUser, newUser);
      
      // If they match with reasonable compatibility
      if (compatibility >= 40) {
        const sharedInterests = findSharedInterests(existingUser, newUser);
        
        const matchInfo = {
          userId: newUser.id,
          name: newUser.name || 'Anonymous',
          age: newUser.age || 'Not specified',
          location: newUser.location || 'Not specified',
          compatibility: Math.round(compatibility),
          sharedInterests: sharedInterests,
          thoughts: newUser.thoughts || '',
          culturalValues: newUser.cultural_values || []
        };
        
        // Send email notification to existing user
        if (existingUser.email) {
          console.log(`📧 Sending match notification to ${existingUser.email} about new match ${newUser.id}`);
          await sendMatchNotification(existingUser.email, existingUser.name, [matchInfo]);
        }
      }
    }
    
    console.log(`📧 Match notifications sent to existing users`);
  } catch (error) {
    console.error('📧 Error sending match notifications:', error);
  }
}

// Calculate compatibility score based on shared values and preferences
function calculateCompatibility(user1, user2) {
  let totalScore = 0;
  let categoryCount = 0;
  
  // Define weighted categories for soul-based matching
  const categories = {
    // High weight - Core values
    cultural_values: { weight: 3, type: 'array' },
    family: { weight: 2.5, type: 'array' },
    culture: { weight: 2.5, type: 'array' },
    relationship_goals: { weight: 2.5, type: 'array' },
    
    // Medium weight - Lifestyle compatibility
    lifestyle: { weight: 2, type: 'array' },
    communication: { weight: 2, type: 'array' },
    life_goal: { weight: 2, type: 'array' },
    
    // Lower weight - Preferences
    art: { weight: 1.5, type: 'array' },
    music: { weight: 1.5, type: 'array' },
    travel: { weight: 1.5, type: 'array' }
  };
  
  // Calculate compatibility for each category
  for (const [category, config] of Object.entries(categories)) {
    const user1Values = user1[category] || [];
    const user2Values = user2[category] || [];
    
    if (user1Values.length > 0 && user2Values.length > 0) {
      const categoryScore = calculateCategoryScore(user1Values, user2Values);
      totalScore += categoryScore * config.weight;
      categoryCount += config.weight;
    }
  }
  
  // Bonus for shared thoughts (philosophical connection)
  if (user1.thoughts && user2.thoughts) {
    const thoughtSimilarity = calculateThoughtSimilarity(user1.thoughts, user2.thoughts);
    totalScore += thoughtSimilarity * 1.5;
    categoryCount += 1.5;
  }
  
  // Age compatibility bonus
  if (user1.age && user2.age) {
    const ageScore = calculateAgeCompatibility(parseInt(user1.age), parseInt(user2.age));
    totalScore += ageScore * 1;
    categoryCount += 1;
  }
  
  return categoryCount > 0 ? (totalScore / categoryCount) * 100 : 0;
}

// Calculate score for array-based categories
function calculateCategoryScore(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return 0;
  
  const commonItems = arr1.filter(item => arr2.includes(item));
  const totalItems = new Set([...arr1, ...arr2]).size;
  
  return totalItems > 0 ? (commonItems.length / totalItems) * 100 : 0;
}

// Calculate similarity between thoughts (simple keyword matching)
function calculateThoughtSimilarity(thoughts1, thoughts2) {
  const words1 = thoughts1.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const words2 = thoughts2.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0;
}

// Calculate age compatibility
function calculateAgeCompatibility(age1, age2) {
  const ageDiff = Math.abs(age1 - age2);
  
  if (ageDiff <= 2) return 100;
  if (ageDiff <= 5) return 80;
  if (ageDiff <= 10) return 60;
  if (ageDiff <= 15) return 40;
  return 20;
}

// Find shared interests between users
function findSharedInterests(user1, user2) {
  const shared = [];
  
  const categories = ['art', 'music', 'life_goal', 'family', 'culture', 'travel', 'communication', 'relationship_goals', 'lifestyle', 'cultural_values'];
  
  for (const category of categories) {
    const user1Values = user1[category] || [];
    const user2Values = user2[category] || [];
    
    if (Array.isArray(user1Values) && Array.isArray(user2Values)) {
      const common = user1Values.filter(item => user2Values.includes(item));
      shared.push(...common);
    }
  }
  
  // Remove duplicates and return top 5
  return [...new Set(shared)].slice(0, 5);
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Choice Love API is running! 💕',
    timestamp: new Date().toISOString()
  });
});

// Submit user quiz and find matches
app.post('/submit', async (req, res) => {
  try {
    const userData = req.body;
    
    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user profile
    const userProfile = {
      id: userId,
      ...userData,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    // Read existing users
    const users = await readData(USERS_FILE);
    
    // Add new user
    users.push(userProfile);
    
    // Save updated users
    await writeData(USERS_FILE, users);
    
    // Find matches
    const matches = await findMatches(userProfile, users);
    
    // Send notifications to existing users who match with the new user
    // This runs in the background and won't block the response
    notifyExistingUsersOfNewMatch(userProfile, users).catch(error => {
      console.error('📧 Background notification error:', error);
    });
    
    res.json({
      success: true,
      userId: userId,
      matches: matches,
      message: 'Profile created and matches found! 💕'
    });
    
  } catch (error) {
    console.error('Error in /submit:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your request. Please try again.'
    });
  }
});

// Get user profile by ID
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const users = await readData(USERS_FILE);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove sensitive data
    delete user.id;
    
    res.json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('Error in /user/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// Get all users (for admin purposes)
app.get('/users', async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    
    // Return basic info only
    const publicUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Anonymous',
      age: user.age || 'Not specified',
      location: user.location || 'Not specified',
      createdAt: user.createdAt
    }));
    
    res.json({
      success: true,
      users: publicUsers,
      total: publicUsers.length
    });
    
  } catch (error) {
    console.error('Error in /users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Update user profile
app.put('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    
    const users = await readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      lastActive: new Date().toISOString()
    };
    
    await writeData(USERS_FILE, users);
    
    res.json({
      success: true,
      message: 'Profile updated successfully! 💕'
    });
    
  } catch (error) {
    console.error('Error in PUT /user/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Get matches for existing user
app.get('/matches/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await readData(USERS_FILE);
    const currentUser = users.find(u => u.id === userId);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const matches = await findMatches(currentUser, users);
    
    res.json({
      success: true,
      matches: matches
    });
    
  } catch (error) {
    console.error('Error in /matches/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding matches'
    });
  }
});

// Send a message
app.post('/send-message', async (req, res) => {
  try {
    const { fromUserId, toUserId, message, fromUserName } = req.body;
    
    if (!fromUserId || !toUserId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fromUserId, toUserId, message'
      });
    }
    
    // Verify users exist
    const users = await readData(USERS_FILE);
    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);
    
    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }
    
    // Create message object
    const messageObj = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: fromUserId,
      toUserId: toUserId,
      fromUserName: fromUserName || fromUser.name || 'Anonymous',
      toUserName: toUser.name || 'Anonymous',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Save message
    const messages = await readData(MESSAGES_FILE);
    messages.push(messageObj);
    await writeData(MESSAGES_FILE, messages);
    
    // Send email notification to recipient
    if (toUser.email) {
      await sendMessageNotification(toUser.email, toUser.name, fromUserName || 'Someone', message);
    }
    
    res.json({
      success: true,
      message: 'Message sent successfully! 💌',
      messageId: messageObj.id
    });
    
  } catch (error) {
    console.error('Error in /send-message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// Get messages for a user
app.get('/messages/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await readData(MESSAGES_FILE);
    
    // Get all messages where user is sender or recipient
    const userMessages = messages.filter(msg => 
      msg.fromUserId === userId || msg.toUserId === userId
    );
    
    // Group messages by conversation
    const conversations = {};
    userMessages.forEach(msg => {
      const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      const otherUserName = msg.fromUserId === userId ? msg.toUserName : msg.fromUserName;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          otherUserId: otherUserId,
          otherUserName: otherUserName,
          messages: []
        };
      }
      
      conversations[otherUserId].messages.push({
        id: msg.id,
        fromUserId: msg.fromUserId,
        toUserId: msg.toUserId,
        fromUserName: msg.fromUserName,
        message: msg.message,
        timestamp: msg.timestamp,
        read: msg.read,
        isFromCurrentUser: msg.fromUserId === userId
      });
    });
    
    // Sort messages in each conversation by timestamp
    Object.values(conversations).forEach(conv => {
      conv.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    res.json({
      success: true,
      conversations: Object.values(conversations)
    });
    
  } catch (error) {
    console.error('Error in /messages/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// Start server
app.listen(PORT, async () => {
  await initializeDataFiles();
  console.log(`💕 Choice Love server running on http://localhost:${PORT}`);
  console.log('🌟 Ready to match souls through shared values!');
});

module.exports = app;
