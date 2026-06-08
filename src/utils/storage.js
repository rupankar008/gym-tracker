import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAm59qLk6OWd_7KwRw1yQ0GIuIFy-4EB9g",
  authDomain: "titanfitgym.firebaseapp.com",
  projectId: "titanfitgym",
  storageBucket: "titanfitgym.firebasestorage.app",
  messagingSenderId: "285870826003",
  appId: "1:285870826003:web:d2f71efdfe794a7160d5e6",
  measurementId: "G-GHFE2V11KK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * REAL CLOUD BACKEND LOGIC (FIREBASE)
 */

export const registerUser = async (name, username, password, gymTime, age, height, weight, gender, goal, diet) => {
  // We use a dummy email to satisfy Firebase Auth while keeping the "Username" UI
  const dummyEmail = `${username.toLowerCase()}@titanfit.com`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, password);
    const uid = userCredential.user.uid;

    const profileData = {
      uid,
      name,
      username,
      gymTime,
      age, 
      height, 
      weight, 
      gender, 
      goal, 
      diet,
      createdAt: new Date().toISOString()
    };

    // Save profile to Firestore
    await setDoc(doc(db, "users", uid), profileData);

    // Initialize user data store in Firestore
    const initialData = {
      completedWorkouts: {},
      streak: 0,
      lastLogin: new Date().toISOString(),
      history: {}
    };
    await setDoc(doc(db, "userData", uid), initialData);

    return profileData;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Username is already taken.');
    }
    throw new Error(error.message);
  }
};

export const loginUser = async (username, password) => {
  const dummyEmail = `${username.toLowerCase()}@titanfit.com`;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, dummyEmail, password);
    const uid = userCredential.user.uid;

    // Fetch Profile
    const profileSnap = await getDoc(doc(db, "users", uid));
    if (!profileSnap.exists()) throw new Error("Profile data not found.");
    const profileData = profileSnap.data();

    // Fetch User Data
    const dataSnap = await getDoc(doc(db, "userData", uid));
    let userData = dataSnap.exists() ? dataSnap.data() : { streak: 0, lastLogin: new Date().toISOString() };

    // Calculate Streak
    const today = new Date().toDateString();
    const lastLoginDate = new Date(userData.lastLogin).toDateString();
    let newStreak = userData.streak || 0;

    if (lastLoginDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastLoginDate === yesterday.toDateString()) {
        newStreak++;
      } else {
        newStreak = 0; 
      }
    }

    userData.lastLogin = new Date().toISOString();
    userData.streak = newStreak;
    
    // Update streak to Firestore
    await setDoc(doc(db, "userData", uid), userData, { merge: true });

    return { profile: profileData, data: userData, uid };
  } catch (error) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      throw new Error('Incorrect username or password.');
    }
    throw new Error(error.message);
  }
};

export const saveUserProgress = async (uid, data) => {
  if (!uid) return;
  await setDoc(doc(db, "userData", uid), data, { merge: true });
};

export const loadUserProgress = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "userData", uid));
  return snap.exists() ? snap.data() : null;
};
