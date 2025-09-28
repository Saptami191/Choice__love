// Progress tracking
function updateProgress() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  const totalQuestions = 8;
  const currentProgress = Math.min((checkedBoxes.length / (checkboxes.length / totalQuestions)) * 100, 100);
  
  progressFill.style.width = currentProgress + '%';
  progressText.textContent = `Progress: ${Math.round(currentProgress)}%`;
}

// Add event listeners to all checkboxes
document.addEventListener('DOMContentLoaded', function() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateProgress);
  });
  
  // Add event listeners for match checking functionality
  setupMatchChecking();
});

// Setup match checking functionality
function setupMatchChecking() {
  const showCheckMatchesBtn = document.getElementById('showCheckMatchesBtn');
  const checkMatchesBtn = document.getElementById('checkMatchesBtn');
  const checkMatchesSection = document.getElementById('check-matches-section');
  
  // Show/hide check matches section
  showCheckMatchesBtn.addEventListener('click', function() {
    if (checkMatchesSection.style.display === 'none') {
      checkMatchesSection.style.display = 'block';
      checkMatchesSection.scrollIntoView({ behavior: 'smooth' });
      showCheckMatchesBtn.textContent = '🔍 Hide Check Matches';
    } else {
      checkMatchesSection.style.display = 'none';
      showCheckMatchesBtn.textContent = '🔍 Check Existing Matches';
    }
  });
  
  // Check matches for existing user
  checkMatchesBtn.addEventListener('click', async function() {
    const userIdInput = document.getElementById('userIdInput');
    const userId = userIdInput.value.trim();
    
    if (!userId) {
      alert('Please enter your User ID');
      return;
    }
    
    // Show loading state
    const originalText = checkMatchesBtn.innerHTML;
    checkMatchesBtn.innerHTML = 'Checking... 💕';
    checkMatchesBtn.disabled = true;
    
    try {
      const response = await fetch(`/matches/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        displayExistingMatches(data);
      } else {
        displayMatchError(data.message);
      }
    } catch (error) {
      console.error('Error checking matches:', error);
      displayMatchError('Could not connect to server. Please try again.');
    } finally {
      // Reset button
      checkMatchesBtn.innerHTML = originalText;
      checkMatchesBtn.disabled = false;
    }
  });
}

// Enhanced form submission with loading animation
document.getElementById("quizForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  
  // Show loading state
  submitBtn.innerHTML = 'Finding Matches... 💕';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';

  try {
    const formData = new FormData(e.target);
    let answers = {};
    
    // Group checkbox values by category
    for (let [key, value] of formData.entries()) {
      if (answers[key]) {
        answers[key].push(value);
      } else {
        answers[key] = [value];
      }
    }

    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers)
    });

    const data = await res.json();
    displayResults(data);
    showAdvancedFeatures();
    
    // Show User ID prominently for future reference
    if (data.userId) {
      showUserIdForReference(data.userId);
      // Store user ID for messaging
      localStorage.setItem('currentUserId', data.userId);
    }
    
  } catch (error) {
    console.error('Error:', error);
    displayError();
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
  }
});

function showAdvancedFeatures() {
  const advancedFeatures = document.getElementById('advanced-features');
  advancedFeatures.style.display = 'block';
  advancedFeatures.scrollIntoView({ behavior: 'smooth' });
}

// Show User ID prominently for future reference
function showUserIdForReference(userId) {
  const resultsDiv = document.getElementById("results");
  
  // Add User ID section at the top of results
  const userIdSection = `
    <div class="user-id-section">
      <h3>🆔 Your User ID (Save This!)</h3>
      <div class="user-id-display">
        <input type="text" value="${userId}" readonly class="user-id-copy" id="userIdCopy">
        <button onclick="copyUserId()" class="copy-btn">📋 Copy</button>
      </div>
      <p class="user-id-instruction">💡 <strong>Important:</strong> Save this User ID! You'll need it to check your matches later.</p>
    </div>
  `;
  
  resultsDiv.innerHTML = userIdSection + resultsDiv.innerHTML;
}

// Copy User ID to clipboard
function copyUserId() {
  const userIdInput = document.getElementById('userIdCopy');
  userIdInput.select();
  userIdInput.setSelectionRange(0, 99999); // For mobile devices
  
  try {
    document.execCommand('copy');
    
    // Show success feedback
    const copyBtn = event.target;
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    copyBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
    
  } catch (err) {
    alert('Could not copy User ID. Please copy it manually.');
  }
}

function displayResults(data) {
  let resultsDiv = document.getElementById("results");
  
  if (data.matches && data.matches.length === 0) {
    resultsDiv.innerHTML = `
      <h3>💔 No Matches Yet</h3>
      <p>Don't worry! Your preferences have been saved. Check back later for more potential matches!</p>
      <div class="encouragement">
        <p>💡 <strong>Tip:</strong> The more people who take the quiz, the better your matches will be!</p>
      </div>
    `;
  } else if (data.matches && data.matches.length > 0) {
    resultsDiv.innerHTML = `<h3>💕 Your Love Matches</h3>`;
    
    data.matches.forEach((m, index) => {
      const compatibility = m.compatibility;
      const compatibilityClass = compatibility >= 80 ? 'excellent' : 
                                compatibility >= 60 ? 'good' : 
                                compatibility >= 40 ? 'fair' : 'low';
      
      resultsDiv.innerHTML += `
        <div class="match-card ${compatibilityClass}">
          <div class="match-header">
            <h4>Match #${index + 1}</h4>
            <div class="compatibility-score">${compatibility}%</div>
          </div>
          <div class="match-details">
            <p><strong>User ID:</strong> ${m.userId}</p>
            <p><strong>Compatibility:</strong> ${getCompatibilityMessage(compatibility)}</p>
            ${m.sharedInterests ? `<p><strong>Shared Interests:</strong> ${m.sharedInterests.join(', ')}</p>` : ''}
          </div>
          <div class="match-actions">
            <button class="action-btn favorite-btn" onclick="addToFavorites('${m.userId}', '${m.userId}', ${compatibility})">
              ❤️ Add to Favorites
            </button>
            <button class="action-btn message-btn" onclick="sendMessage('${m.userId}', '${m.userId}')">
              💬 Send Message
            </button>
          </div>
        </div>
      `;
    });
  } else {
    // Fallback for demo purposes - emphasizing the philosophy
    resultsDiv.innerHTML = `
      <h3>🎉 Your Soul Profile Complete!</h3>
      <div class="philosophy-message">
        <p>Your preferences and thoughts have been recorded. Here's what soul-based matching looks like:</p>
      </div>
      <div class="match-card excellent">
        <div class="match-header">
          <h4>Soul Connection Preview</h4>
          <div class="compatibility-score">92%</div>
        </div>
        <div class="match-details">
          <p><strong>Soul Compatibility:</strong> Deep connection through shared values and cultural respect</p>
          <p><strong>Shared Values:</strong> Family-first, Elder respect, Cultural traditions</p>
          <p><strong>Art & Music:</strong> Classical music, Poetry, Cultural experiences</p>
          <p><strong>Life Goals:</strong> Knowledge, Happiness, Adventure with meaning</p>
          <div class="connection-note">
            <p>💫 <strong>Connection Note:</strong> This match shares your deep respect for cultural values and family traditions. Your souls resonate through shared artistic tastes and life philosophy.</p>
          </div>
        </div>
        <div class="match-actions">
          <button class="action-btn favorite-btn" onclick="addToFavorites('demo-user-1', 'Soul Match', 92)">
            ❤️ Add to Favorites
          </button>
          <button class="action-btn message-btn" onclick="sendMessage('demo-user-1', 'Soul Match')">
            💬 Send Message
          </button>
        </div>
      </div>
      <div class="philosophy-footer">
        <p><strong>The Magic:</strong> True love happens when two souls understand each other's values, even without words. Your shared respect for elders, cultural traditions, and artistic expression creates a foundation for deep connection.</p>
      </div>
    `;
  }
  
  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function displayError() {
  let resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <h3>⚠️ Connection Error</h3>
    <p>We couldn't connect to our matching server. Please try again later!</p>
    <p><strong>Your responses have been saved locally.</strong></p>
  `;
}

// Display existing matches for a user
function displayExistingMatches(data) {
  let resultsDiv = document.getElementById("results");
  
  if (data.matches && data.matches.length === 0) {
    resultsDiv.innerHTML = `
      <h3>💔 No New Matches Yet</h3>
      <p>Your profile is still active! Check back later for more potential matches.</p>
      <div class="encouragement">
        <p>💡 <strong>Tip:</strong> The more people who take the quiz, the better your matches will be!</p>
        <p>🔄 <strong>Refresh:</strong> New users join regularly, so check back often!</p>
      </div>
    `;
  } else if (data.matches && data.matches.length > 0) {
    resultsDiv.innerHTML = `<h3>💕 Your Current Matches</h3>`;
    
    data.matches.forEach((m, index) => {
      const compatibility = m.compatibility;
      const compatibilityClass = compatibility >= 80 ? 'excellent' : 
                                compatibility >= 60 ? 'good' : 
                                compatibility >= 40 ? 'fair' : 'low';
      
      resultsDiv.innerHTML += `
        <div class="match-card ${compatibilityClass}">
          <div class="match-header">
            <h4>Match #${index + 1}</h4>
            <div class="compatibility-score">${compatibility}%</div>
          </div>
          <div class="match-details">
            <p><strong>User ID:</strong> ${m.userId}</p>
            <p><strong>Compatibility:</strong> ${getCompatibilityMessage(compatibility)}</p>
            ${m.sharedInterests ? `<p><strong>Shared Interests:</strong> ${m.sharedInterests.join(', ')}</p>` : ''}
            ${m.thoughts ? `<p><strong>Their Thoughts:</strong> "${m.thoughts.substring(0, 100)}${m.thoughts.length > 100 ? '...' : ''}"</p>` : ''}
          </div>
          <div class="match-actions">
            <button class="action-btn favorite-btn" onclick="addToFavorites('${m.userId}', '${m.userId}', ${compatibility})">
              ❤️ Add to Favorites
            </button>
            <button class="action-btn message-btn" onclick="sendMessage('${m.userId}', '${m.userId}')">
              💬 Send Message
            </button>
          </div>
        </div>
      `;
    });
    
    // Add refresh suggestion
    resultsDiv.innerHTML += `
      <div class="encouragement">
        <p>🔄 <strong>Keep Checking:</strong> New users join regularly! Check back often for fresh matches.</p>
        <p>💡 <strong>Tip:</strong> Your compatibility scores may improve as more people with similar values join!</p>
      </div>
    `;
  }
  
  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Display error for match checking
function displayMatchError(message) {
  let resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <h3>⚠️ Error Checking Matches</h3>
    <p>${message}</p>
    <div class="encouragement">
      <p>💡 <strong>Possible reasons:</strong></p>
      <ul style="text-align: left; margin: 10px 0;">
        <li>User ID not found - make sure you copied it correctly</li>
        <li>Server connection issue - try again in a moment</li>
        <li>User ID format: should start with "user_" followed by numbers and letters</li>
      </ul>
    </div>
  `;
}

function getCompatibilityMessage(score) {
  if (score >= 90) return "Perfect soul connection! ✨";
  if (score >= 80) return "Excellent match! 🌟";
  if (score >= 70) return "Great potential! 💕";
  if (score >= 60) return "Good compatibility! 💖";
  if (score >= 40) return "Interesting match! 💫";
  return "Unique connection! 🌈";
}

// Advanced Feature Functions
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  let message = 'Your Favorite Matches:\n\n';
  
  if (favorites.length === 0) {
    message += 'No favorites yet. Click the ❤️ button on matches you like!';
  } else {
    favorites.forEach((fav, index) => {
      message += `${index + 1}. ${fav.name || 'Anonymous'} - ${fav.compatibility}% compatibility\n`;
    });
  }
  
  alert(message);
}

async function showMessages() {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    alert('Please complete the quiz first to get your User ID');
    return;
  }
  
  try {
    const response = await fetch(`/messages/${currentUserId}`);
    const data = await response.json();
    
    if (data.success) {
      if (data.conversations.length === 0) {
        alert('No messages yet. Start a conversation with your matches!');
      } else {
        let message = 'Your Conversations:\n\n';
        data.conversations.forEach((conv, index) => {
          message += `${index + 1}. ${conv.otherUserName} (${conv.otherUserId})\n`;
          if (conv.messages.length > 0) {
            const lastMessage = conv.messages[conv.messages.length - 1];
            message += `   Last message: "${lastMessage.message}"\n`;
            message += `   Time: ${new Date(lastMessage.timestamp).toLocaleString()}\n\n`;
          }
        });
        alert(message);
      }
    } else {
      alert('Error loading messages: ' + data.message);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    alert('Error loading messages. Please try again.');
  }
}

function showDetailedAnalysis() {
  const formData = new FormData(document.getElementById('quizForm'));
  let analysis = 'Detailed Compatibility Analysis:\n\n';
  
  // Analyze responses
  const categories = {
    'art': 'Artistic Preferences',
    'music': 'Musical Taste',
    'life_goal': 'Life Goals',
    'family': 'Family Values',
    'culture': 'Cultural Respect',
    'travel': 'Travel Style',
    'communication': 'Communication Style',
    'relationship_goals': 'Relationship Goals',
    'lifestyle': 'Lifestyle Preferences',
    'cultural_values': 'Cultural Values'
  };
  
  let totalScore = 0;
  let categoryCount = 0;
  
  for (let [key, value] of formData.entries()) {
    if (categories[key] && value) {
      analysis += `${categories[key]}: ${value}\n`;
      totalScore += Math.random() * 20 + 70; // Simulate scoring
      categoryCount++;
    }
  }
  
  if (categoryCount > 0) {
    const avgScore = Math.round(totalScore / categoryCount);
    analysis += `\nOverall Compatibility Score: ${avgScore}%\n`;
    analysis += `Compatibility Level: ${getCompatibilityMessage(avgScore)}\n\n`;
    
    analysis += 'Key Strengths:\n';
    analysis += '• Strong cultural values alignment\n';
    analysis += '• Shared artistic and musical interests\n';
    analysis += '• Compatible life goals and aspirations\n';
    analysis += '• Similar family and relationship values\n\n';
    
    analysis += 'Areas for Growth:\n';
    analysis += '• Explore different communication styles\n';
    analysis += '• Share more personal thoughts and dreams\n';
    analysis += '• Build on shared cultural traditions';
  }
  
  alert(analysis);
}

function showRefineOptions() {
  const refineOptions = `
Refine Your Search Options:

🎯 Current Preferences:
• Age Range: ${document.querySelector('[name="age_preference"]').value}
• Min Compatibility: ${document.querySelector('[name="min_compatibility"]').value}%

💡 Suggestions for Better Matches:
• Complete all optional profile fields
• Share more thoughts in the textarea
• Be specific about cultural values
• Consider expanding age range

🔧 Quick Actions:
• Adjust age preferences
• Change compatibility threshold
• Add more cultural values
• Update your thoughts and reflections

Click OK to continue, or modify your preferences above and submit again!`;

  alert(refineOptions);
}

// Add favorite functionality to match cards
function addToFavorites(matchId, matchName, compatibility) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const newFavorite = {
    id: matchId,
    name: matchName,
    compatibility: compatibility,
    date: new Date().toISOString()
  };
  
  favorites.push(newFavorite);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Show confirmation
  const btn = event.target;
  btn.innerHTML = '❤️ Added!';
  btn.style.background = '#4CAF50';
  setTimeout(() => {
    btn.innerHTML = '❤️ Add to Favorites';
    btn.style.background = '';
  }, 2000);
}

// Send message functionality
async function sendMessage(matchId, matchName) {
  // Get current user ID from the form or stored data
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    alert('Please complete the quiz first to get your User ID');
    return;
  }
  
  const message = prompt(`Send a message to ${matchName}:`);
  if (message && message.trim()) {
    try {
      const response = await fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUserId,
          toUserId: matchId,
          message: message.trim(),
          fromUserName: getCurrentUserName()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Message sent successfully! 💌');
        // Show message interface
        showMessageInterface(matchId, matchName);
      } else {
        alert('Error sending message: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  }
}

// Get current user ID from stored data or form
function getCurrentUserId() {
  // Try to get from localStorage first
  const storedUserId = localStorage.getItem('currentUserId');
  if (storedUserId) return storedUserId;
  
  // Try to get from the User ID display if it exists
  const userIdInput = document.getElementById('userIdCopy');
  if (userIdInput && userIdInput.value) {
    return userIdInput.value;
  }
  
  return null;
}

// Get current user name
function getCurrentUserName() {
  const nameInput = document.querySelector('input[name="name"]');
  return nameInput ? nameInput.value : 'Anonymous';
}

// Show message interface
function showMessageInterface(matchId, matchName) {
  const messageInterface = `
    <div id="messageInterface" style="margin-top: 20px; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 15px;">
      <h3>💬 Conversation with ${matchName}</h3>
      <div id="messageContainer" style="max-height: 300px; overflow-y: auto; margin: 15px 0; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
        <p style="text-align: center; color: rgba(255, 255, 255, 0.7);">Loading messages...</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <input type="text" id="newMessageInput" placeholder="Type your message..." style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white;">
        <button onclick="sendNewMessage('${matchId}', '${matchName}')" style="padding: 10px 20px; background: linear-gradient(45deg, #ff6b9d, #ff8fab); color: white; border: none; border-radius: 8px; cursor: pointer;">Send</button>
      </div>
      <button onclick="hideMessageInterface()" style="margin-top: 10px; padding: 8px 15px; background: rgba(255, 255, 255, 0.2); color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
    </div>
  `;
  
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML += messageInterface;
  
  // Load existing messages
  loadMessages(matchId);
}

// Send new message
async function sendNewMessage(matchId, matchName) {
  const messageInput = document.getElementById('newMessageInput');
  const message = messageInput.value.trim();
  
  if (!message) return;
  
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    alert('Please complete the quiz first to get your User ID');
    return;
  }
  
  try {
    const response = await fetch('/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUserId: currentUserId,
        toUserId: matchId,
        message: message,
        fromUserName: getCurrentUserName()
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageInput.value = '';
      loadMessages(matchId); // Reload messages
    } else {
      alert('Error sending message: ' + data.message);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please try again.');
  }
}

// Load messages for a conversation
async function loadMessages(matchId) {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;
  
  try {
    const response = await fetch(`/messages/${currentUserId}`);
    const data = await response.json();
    
    if (data.success) {
      const conversation = data.conversations.find(conv => conv.otherUserId === matchId);
      const messageContainer = document.getElementById('messageContainer');
      
      if (conversation && conversation.messages.length > 0) {
        messageContainer.innerHTML = conversation.messages.map(msg => `
          <div style="margin: 10px 0; padding: 10px; border-radius: 10px; ${msg.isFromCurrentUser ? 'background: rgba(255, 107, 157, 0.3); margin-left: 20px;' : 'background: rgba(255, 255, 255, 0.1); margin-right: 20px;'}">
            <div style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.7); margin-bottom: 5px;">
              ${msg.fromUserName} • ${new Date(msg.timestamp).toLocaleString()}
            </div>
            <div style="color: white;">${msg.message}</div>
          </div>
        `).join('');
      } else {
        messageContainer.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7);">No messages yet. Start the conversation!</p>';
      }
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    document.getElementById('messageContainer').innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7);">Error loading messages</p>';
  }
}

// Hide message interface
function hideMessageInterface() {
  const messageInterface = document.getElementById('messageInterface');
  if (messageInterface) {
    messageInterface.remove();
  }
}
