import localforage from 'localforage';

// Configure localforage to act as our database
localforage.config({
  name: 'TitanFit_DB'
});

/**
 * MOCK BACKEND LOGIC
 */

export const registerUser = async (name, username, password, gymTime) => {
  // Get existing users
  let users = await localforage.getItem('users');
  if (!users) {
    users = {};
  }

  // Check uniqueness
  if (users[username]) {
    throw new Error('Username is already taken.');
  }

  // Save new user
  users[username] = {
    name,
    username,
    password, // In a real app, this would be hashed
    gymTime
  };
  await localforage.setItem('users', users);

  // Initialize their data store
  await localforage.setItem(`userData_${username}`, {
    completedWorkouts: {},
    streak: 0,
    lastLogin: new Date().toISOString(),
    history: {}
  });

  return users[username];
};

export const loginUser = async (username, password) => {
  const users = await localforage.getItem('users');
  if (!users || !users[username]) {
    throw new Error('Username not found.');
  }

  if (users[username].password !== password) {
    throw new Error('Incorrect password.');
  }

  // Get user data
  const userData = await localforage.getItem(`userData_${username}`);
  
  // Calculate streak logic (simplified for mockup)
  const today = new Date().toDateString();
  const lastLoginDate = new Date(userData.lastLogin).toDateString();
  let newStreak = userData.streak;

  if (lastLoginDate !== today) {
    // If last login was exactly yesterday, increment. Otherwise, reset if older than yesterday.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastLoginDate === yesterday.toDateString()) {
      newStreak++;
    } else {
      // It's a new day, but missed yesterday
      newStreak = 0; 
    }
  }

  userData.lastLogin = new Date().toISOString();
  userData.streak = newStreak;
  await localforage.setItem(`userData_${username}`, userData);

  return { profile: users[username], data: userData };
};

export const saveUserProgress = async (username, data) => {
  await localforage.setItem(`userData_${username}`, data);
};

export const loadUserProgress = async (username) => {
  return await localforage.getItem(`userData_${username}`);
};
