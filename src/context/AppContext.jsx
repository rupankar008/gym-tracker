import { createContext, useState, useEffect } from 'react';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

export const AppContext = createContext();

// Heuristic Indian Food Database for Auto-parsing
const FOOD_NUTRITION_DB = {
  paneer: { calories: 2.6, protein: 0.2, carbs: 0.04, fats: 0.2 },
  chicken: { calories: 1.6, protein: 0.3, carbs: 0.0, fats: 0.04 },
  rice: { calories: 1.3, protein: 0.03, carbs: 0.28, fats: 0.0 },
  roti: { calories: 2.6, protein: 0.08, carbs: 0.55, fats: 0.03 },
  chapati: { calories: 2.6, protein: 0.08, carbs: 0.55, fats: 0.03 },
  egg: { calories: 1.4, protein: 0.13, carbs: 0.01, fats: 0.1 },
  eggs: { calories: 1.4, protein: 0.13, carbs: 0.01, fats: 0.1 },
  oats: { calories: 3.8, protein: 0.13, carbs: 0.66, fats: 0.07 },
  whey: { calories: 4.0, protein: 0.8, carbs: 0.1, fats: 0.05 },
  protein: { calories: 4.0, protein: 0.8, carbs: 0.1, fats: 0.05 },
  soya: { calories: 3.5, protein: 0.5, carbs: 0.3, fats: 0.01 },
  soy: { calories: 3.5, protein: 0.5, carbs: 0.3, fats: 0.01 },
  dal: { calories: 1.2, protein: 0.08, carbs: 0.2, fats: 0.01 },
  lentils: { calories: 1.2, protein: 0.08, carbs: 0.2, fats: 0.01 },
  fish: { calories: 2.0, protein: 0.22, carbs: 0.0, fats: 0.12 },
  salmon: { calories: 2.0, protein: 0.22, carbs: 0.0, fats: 0.12 },
  peanut: { calories: 5.8, protein: 0.25, carbs: 0.2, fats: 0.5 },
  milk: { calories: 0.6, protein: 0.03, carbs: 0.05, fats: 0.03 },
  almonds: { calories: 5.7, protein: 0.21, carbs: 0.22, fats: 0.5 },
  salad: { calories: 0.3, protein: 0.01, carbs: 0.07, fats: 0.0 },
  vegetables: { calories: 0.3, protein: 0.01, carbs: 0.07, fats: 0.0 },
  biryani: { calories: 1.8, protein: 0.09, carbs: 0.25, fats: 0.06 },
  pulao: { calories: 1.5, protein: 0.04, carbs: 0.28, fats: 0.03 },
  dosa: { calories: 1.7, protein: 0.04, carbs: 0.3, fats: 0.04 },
  idli: { calories: 1.3, protein: 0.05, carbs: 0.28, fats: 0.0 },
  curd: { calories: 0.6, protein: 0.04, carbs: 0.04, fats: 0.03 }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('titan_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('titan_meals');
    return saved ? JSON.parse(saved) : [];
  });

  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem('titan_water');
    return saved ? parseFloat(saved) : 0;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('titan_streak');
    return saved ? parseInt(saved) : 5;
  });

  // Track detailed exercise sets/reps performance:
  // { [date]: { [exerciseId]: { targetSets: 4, targetReps: 10, completedSets: [1, 2] } } }
  const [completedWorkouts, setCompletedWorkouts] = useState(() => {
    const saved = localStorage.getItem('titan_completed_workouts_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('titan_chat');
    return saved ? JSON.parse(saved) : [
      { id: 1, sender: 'ai', text: "LIFT HEAVY OR DIE TRYING! I'm your AI Coach. Ready to unleash the beast today?" }
    ];
  });

  const [supplements, setSupplements] = useState(() => {
    const saved = localStorage.getItem('titan_supplements');
    return saved ? JSON.parse(saved) : [];
  });

  const [supplementLog, setSupplementLog] = useState(() => {
    const saved = localStorage.getItem('titan_supplement_log');
    return saved ? JSON.parse(saved) : {};
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    const saved = localStorage.getItem('titan_prs');
    return saved ? JSON.parse(saved) : {};
  });

  const [bodyMeasurements, setBodyMeasurements] = useState(() => {
    const saved = localStorage.getItem('titan_measurements');
    return saved ? JSON.parse(saved) : [];
  });

  const [beastMode, setBeastMode] = useState(false);
  const [beastTimerActive, setBeastTimerActive] = useState(false);
  const [beastCountdown, setBeastCountdown] = useState(5);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('titan_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('titan_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('titan_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('titan_water', water.toString());
  }, [water]);

  useEffect(() => {
    localStorage.setItem('titan_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('titan_completed_workouts_v2', JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  useEffect(() => {
    localStorage.setItem('titan_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('titan_supplements', JSON.stringify(supplements));
  }, [supplements]);

  useEffect(() => {
    localStorage.setItem('titan_supplement_log', JSON.stringify(supplementLog));
  }, [supplementLog]);

  useEffect(() => {
    localStorage.setItem('titan_prs', JSON.stringify(personalRecords));
  }, [personalRecords]);

  useEffect(() => {
    localStorage.setItem('titan_measurements', JSON.stringify(bodyMeasurements));
  }, [bodyMeasurements]);

  const triggerBeastMode = (active) => {
    if (active) {
      setBeastTimerActive(true);
      setBeastCountdown(5);
      const interval = setInterval(() => {
        setBeastCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setBeastTimerActive(false);
            setBeastMode(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBeastMode(false);
      setBeastTimerActive(false);
    }
  };

  const parseFoodQuery = (query, mealType = 'Breakfast') => {
    const qLower = query.toLowerCase();
    const weightMatch = qLower.match(/(\d+)\s*(g|gram|grams)/);
    let weight = 150;
    if (weightMatch) {
      weight = parseInt(weightMatch[1]);
    }

    const detectedKeys = [];
    Object.keys(FOOD_NUTRITION_DB).forEach(key => {
      if (qLower.includes(key)) {
        detectedKeys.push(key);
      }
    });

    let finalCals = 0;
    let finalProtein = 0;
    let finalCarbs = 0;
    let finalFats = 0;

    if (detectedKeys.length > 0) {
      const portionWeight = weight / detectedKeys.length;
      detectedKeys.forEach(key => {
        const item = FOOD_NUTRITION_DB[key];
        finalCals += item.calories * portionWeight;
        finalProtein += item.protein * portionWeight;
        finalCarbs += item.carbs * portionWeight;
        finalFats += item.fats * portionWeight;
      });
    } else {
      finalCals = 2.0 * weight;
      finalProtein = 0.08 * weight;
      finalCarbs = 0.25 * weight;
      finalFats = 0.07 * weight;
    }

    return {
      name: query,
      calories: Math.round(finalCals),
      protein: Math.round(finalProtein),
      carbs: Math.round(finalCarbs),
      fats: Math.round(finalFats),
      type: mealType
    };
  };

  const login = (userData, backendData = null) => {
    setUser(userData);
    if (backendData) {
      if (backendData.streak !== undefined) setStreak(backendData.streak);
      if (backendData.completedWorkouts) setCompletedWorkouts(backendData.completedWorkouts);
      if (backendData.water !== undefined) setWater(backendData.water);
      if (backendData.meals) setMeals(backendData.meals);
    }
  };

  const updateUser = (newFields) => {
    setUser(prev => {
      const updated = { ...prev, ...newFields };
      if (updated.uid) {
        import('../utils/storage').then(({ db, setDoc, doc }) => {
          setDoc(doc(db, "users", updated.uid), updated, { merge: true });
        }).catch(err => console.error("Failed to sync profile:", err));
      }
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setMeals([]);
    setWater(0);
    setStreak(5);
    setCompletedWorkouts({});
    setChatHistory([
      { id: 1, sender: 'ai', text: "LIFT HEAVY OR DIE TRYING! I'm your AI Coach. Ready to unleash the beast today?" }
    ]);
    localStorage.clear();
  };

  const addMeal = (meal) => {
    setMeals(prev => [...prev, { ...meal, id: Date.now() }]);
  };

  const deleteMeal = (id) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  // --- Supplement Helpers ---
  const addSupplement = (supp) => {
    setSupplements(prev => [...prev, { ...supp, id: Date.now(), streak: 0 }]);
  };

  const deleteSupplement = (id) => {
    setSupplements(prev => prev.filter(s => s.id !== id));
  };

  const toggleSupplementTaken = (suppId) => {
    const today = new Date().toISOString().split('T')[0];
    setSupplementLog(prev => {
      const dayLog = prev[today] || {};
      const isTaken = dayLog[suppId];
      return { ...prev, [today]: { ...dayLog, [suppId]: !isTaken } };
    });
    // Update streak on supplement
    setSupplements(prev => prev.map(s => {
      if (s.id !== suppId) return s;
      const today = new Date().toISOString().split('T')[0];
      return { ...s, lastTaken: today, streak: (s.streak || 0) + 1 };
    }));
  };

  const isSupplementTakenToday = (suppId) => {
    const today = new Date().toISOString().split('T')[0];
    return !!(supplementLog[today] && supplementLog[today][suppId]);
  };

  // --- Personal Records ---
  const updatePersonalRecord = (exerciseId, exerciseName, weight, reps) => {
    const estimated1RM = Math.round(weight * (1 + reps / 30));
    setPersonalRecords(prev => {
      const existing = prev[exerciseId];
      if (!existing || estimated1RM > existing.estimated1RM) {
        return {
          ...prev,
          [exerciseId]: {
            exerciseName,
            weight,
            reps,
            estimated1RM,
            date: new Date().toISOString().split('T')[0]
          }
        };
      }
      return prev;
    });
  };

  // --- Body Measurements ---
  const addBodyMeasurement = (entry) => {
    setBodyMeasurements(prev => [
      ...prev,
      { ...entry, date: new Date().toISOString().split('T')[0], id: Date.now() }
    ]);
  };

  // Workout state tracking:
  // Toggle set completion (e.g. Set 1, Set 2, Set 3)
  const toggleExerciseSet = (date, exerciseId, setNum, defaultTargetSets = 4, defaultTargetReps = 10, setDetails = null) => {
    setCompletedWorkouts(prev => {
      const dayData = prev[date] || {};
      const exData = dayData[exerciseId] || {
        targetSets: defaultTargetSets,
        targetReps: defaultTargetReps,
        completedSets: []
      };

      // Check if this set is already completed (either by number or object property)
      const isCompletedIndex = exData.completedSets.findIndex(s => 
        (typeof s === 'number' ? s === setNum : s.setNum === setNum)
      );
      
      let updatedSets = [...exData.completedSets];

      if (isCompletedIndex >= 0) {
        // If already completed, remove it (toggle off)
        updatedSets.splice(isCompletedIndex, 1);
      } else {
        // If not completed, add it. If setDetails are provided, add the object, otherwise just add the number (legacy fallback)
        const newSetEntry = setDetails ? { setNum, ...setDetails } : setNum;
        updatedSets.push(newSetEntry);
      }

      return {
        ...prev,
        [date]: {
          ...dayData,
          [exerciseId]: {
            ...exData,
            completedSets: updatedSets
          }
        }
      };
    });
  };

  // Edit target sets/reps goal dynamically
  const updateExerciseGoals = (date, exerciseId, targetSets, targetReps) => {
    setCompletedWorkouts(prev => {
      const dayData = prev[date] || {};
      const exData = dayData[exerciseId] || { completedSets: [] };

      return {
        ...prev,
        [date]: {
          ...dayData,
          [exerciseId]: {
            ...exData,
            targetSets: parseInt(targetSets) || 4,
            targetReps: parseInt(targetReps) || 10
          }
        }
      };
    });
  };

  // Calculate volume completed per muscle group
  const getMuscleVolumeData = (date) => {
    const dayData = completedWorkouts[date] || {};
    const volumes = { Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0 };

    Object.keys(dayData).forEach(exId => {
      // Find category of this exercise
      const ex = EXERCISE_LIBRARY.find(item => item.id === exId);
      const cat = ex ? ex.category : 'Chest';
      const setsCompletedCount = dayData[exId].completedSets ? dayData[exId].completedSets.length : 0;
      
      if (volumes[cat] !== undefined) {
        volumes[cat] += setsCompletedCount;
      }
    });

    return Object.keys(volumes).map(key => ({
      name: key,
      sets: volumes[key]
    }));
  };

  const calculateTargets = () => {
    if (!user) return { calories: 2000, protein: 120, carbs: 250, fats: 60 };
    const weight = parseFloat(user.weight) || 70;
    const height = parseFloat(user.height) || 170;
    const age = parseFloat(user.age) || 25;
    
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    if (user.gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const tdee = Math.round(bmr * 1.55);
    
    let targetCal = tdee;
    if (user.goal === 'bulking') targetCal = tdee + 400;
    if (user.goal === 'cutting') targetCal = tdee - 500;
    
    // Override if custom calories are set
    if (user.customCalories) {
      targetCal = parseInt(user.customCalories);
    }
    
    if (user.goal === 'bulking') {
      return {
        calories: targetCal,
        protein: Math.round(weight * 2.2),
        carbs: Math.round((targetCal * 0.5) / 4),
        fats: Math.round((targetCal * 0.25) / 9)
      };
    } else if (user.goal === 'cutting') {
      return {
        calories: targetCal,
        protein: Math.round(weight * 2.5),
        carbs: Math.round((targetCal * 0.35) / 4),
        fats: Math.round((targetCal * 0.25) / 9)
      };
    } else {
      return {
        calories: targetCal,
        protein: Math.round(weight * 2.0),
        carbs: Math.round((targetCal * 0.45) / 4),
        fats: Math.round((targetCal * 0.25) / 9)
      };
    }
  };

  const targets = calculateTargets();

  return (
    <AppContext.Provider value={{
      user,
      login,
      updateUser,
      logout,
      meals,
      addMeal,
      deleteMeal,
      water,
      setWater,
      streak,
      setStreak,
      completedWorkouts,
      toggleExerciseSet,
      updateExerciseGoals,
      getMuscleVolumeData,
      chatHistory,
      setChatHistory,
      targets,
      beastMode,
      beastTimerActive,
      beastCountdown,
      triggerBeastMode,
      parseFoodQuery,
      supplements,
      addSupplement,
      deleteSupplement,
      toggleSupplementTaken,
      isSupplementTakenToday,
      personalRecords,
      updatePersonalRecord,
      bodyMeasurements,
      addBodyMeasurement,
    }}>
      {children}
    </AppContext.Provider>
  );
};
