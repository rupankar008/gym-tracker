import { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Bot, Send, Flame } from 'lucide-react';
import styles from './AIAssistant.module.css';

const AIAssistant = () => {
  const { user, chatHistory, setChatHistory, meals, targets, water, streak } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const consumedCalories = meals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0);
  const consumedProtein = meals.reduce((sum, m) => sum + (parseFloat(m.protein) || 0), 0);
  const consumedCarbs = meals.reduce((sum, m) => sum + (parseFloat(m.carbs) || 0), 0);
  const consumedFats = meals.reduce((sum, m) => sum + (parseFloat(m.fats) || 0), 0);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Hardcore personalized AI response engine
    setTimeout(() => {
      let reply = '';
      const textLower = input.toLowerCase();
      const goalStr = user?.goal || 'bulking';
      const weightStr = user?.weight || '70';
      const dietStr = user?.diet || 'non-veg';
      const name = user?.name || 'Warrior';
      const gymTimeStr = user?.gymTime || '06:00 PM';

      // 1. Gym Timing & Pre-Workout Queries
      if (textLower.includes('time') || textLower.includes('schedule') || textLower.includes('pre-workout') || textLower.includes('preworkout')) {
        let preWorkoutTime = '1.5 hours prior';
        if (gymTimeStr && gymTimeStr.includes(':')) {
          const [h, m] = gymTimeStr.split(':').map(Number);
          let date = new Date();
          date.setHours(h, m, 0);
          date.setMinutes(date.getMinutes() - 90); // 1.5 hours before
          preWorkoutTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        reply = `GYM TIMING STRATEGY INITIATED, ${name.toUpperCase()}! 
- YOUR REGISTERED LIFT TIME IS: ${gymTimeStr}.
- PRE-WORKOUT WINDOW: ${preWorkoutTime}.
- PRE-WORKOUT SUGGESTION: 
  * Veg: 1 Black Coffee + 1 Banana with 1 tbsp Peanut Butter.
  * Non-Veg: 3 Boiled Egg Whites + 1 Sweet Potato.
  * Vegan: Oats with Soy Milk & Berries.
- CRITICAL TIP: Sip 500ml water during your session to avoid cramping!`;
      } 
      // 2. High Protein Indian Recipes
      else if (textLower.includes('recipe') || textLower.includes('cook') || textLower.includes('make')) {
        if (textLower.includes('paneer')) {
          reply = `HIGH-PROTEIN PANEER TIKKA RECIPE (28g Protein):
1. Cut 150g Low-Fat Paneer, Bell Peppers, and Onions into cubes.
2. Marinate with 3 tbsp Curd, 1 tsp Ginger-Garlic paste, Red Chilli powder, Turmeric, and Garam Masala.
3. Keep marinated for 30 minutes.
4. Roast on a non-stick pan with 1 tsp Olive Oil until golden brown.
5. Squeeze fresh lemon juice. CRUSH IT!`;
        } else if (textLower.includes('chicken')) {
          reply = `LEAN CHICKEN SALAD RECIPE (42g Protein):
1. Boil 150g Chicken Breast with salt and pepper. Shred it.
2. Toss in a bowl with chopped Cucumbers, Tomatoes, Lettuce, and Coriander.
3. Dressing: 1 tbsp Olive Oil, Lemon juice, and a pinch of rock salt.
4. Add 10g roasted almonds for healthy fats. FUEL FOR THE BEAST!`;
        } else if (textLower.includes('soya') || textLower.includes('soy')) {
          reply = `SOYA CHUNKS SCRAMBLE/BHURJI RECIPE (35g Protein):
1. Boil 60g Soya Chunks. Drain the water completely and mince them.
2. Heat 1 tsp Mustard oil in a pan, add Cumin seeds, chopped Onions, Tomatoes, and Green Chillies.
3. Sauté until soft, add turmeric, chilli powder, and coriander powder.
4. Add the minced soya, scramble for 5 minutes. Eat hot with 1 Roti!`;
        } else {
          reply = `PROTEIN RECIPES DIRECTORY:
I have custom Indian guides for:
- [PANEER TIKKA] (Veg)
- [CHICKEN SALAD] (Non-Veg)
- [SOYA BHURJI] (Vegan/Veg)
Just ask me: "give me a paneer recipe" or "how to cook soya"!`;
        }
      } 
      // 3. Calories and Metrics Queries
      else if (textLower.includes('calorie') || textLower.includes('kcal') || textLower.includes('eat') || textLower.includes('consumed')) {
        reply = `STATS UPDATE, ${name.toUpperCase()}! TODAY YOU LOGGED ${consumedCalories} KCAL OUT OF YOUR ${targets.calories} KCAL TARGET. YOU HAVE ${Math.max(0, targets.calories - consumedCalories)} KCAL REMAINING TO REACH YOUR GOAL!`;
      } 
      else if (textLower.includes('protein') || textLower.includes('gram') || textLower.includes('macros')) {
        reply = `MACROS SCORECARD, ${name.toUpperCase()}:\n- PROTEIN: ${consumedProtein}g / ${targets.protein}g Target\n- CARBS: ${consumedCarbs}g / ${targets.carbs}g Target\n- FATS: ${consumedFats}g / ${targets.fats}g Target\nKEEP EATING CLEAN AND HIT THESE TARGETS!`;
      } 
      else if (textLower.includes('water') || textLower.includes('drink') || textLower.includes('hydrate')) {
        reply = `HYDRATION CHECK! YOU HAVE LOGGED ${water.toFixed(2)} LITERS OF WATER TODAY OUT OF YOUR 4.0L DAILY MINIMUM. KEEP CHUGGING!`;
      } 
      else if (textLower.includes('streak') || textLower.includes('day')) {
        reply = `YOUR STREAK IS CURRENTLY AT ${streak} DAYS! CONSISTENCY IS KEY. DO NOT BREAK THE CHAIN!`;
      } 
      else if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey')) {
        reply = `READY FOR ACTION, ${name.toUpperCase()}! HEIGHT: ${user?.height}CM | WEIGHT: ${weightStr}KG | TARGET: ${goalStr.toUpperCase()} | GYM WINDOW: ${gymTimeStr}. ASK ME ABOUT PRE-WORKOUT MEALS OR HIGH-PROTEIN INDIAN RECIPES!`;
      } 
      else if (textLower.includes('workout') || textLower.includes('routine') || textLower.includes('exercise') || textLower.includes('gym')) {
        if (textLower.includes('chest') || textLower.includes('bench')) {
          reply = `CHEST MATRIX ACTIVE! Barbell Bench Press (heavy 4x8), Incline Dumbbell Press (4x10), and Cable Crossovers. Squeeze at the top and push hard!`;
        } else if (textLower.includes('back') || textLower.includes('deadlift')) {
          reply = `BACK MATRIX ACTIVE! Conventional Deadlifts (4x5), Wide Lat Pulldowns (4x10), and Bent-Over Rows (3x8). Pull with your elbows!`;
        } else if (textLower.includes('leg') || textLower.includes('squat')) {
          reply = `LEG MATRIX ACTIVE! Squats (4x8), Leg Press (4x10), Lying Leg Curls, and Standing Calf Raises. Embrace the burn!`;
        } else {
          reply = `WORKOUT MATRIX ACTIVE. YOU ARE CURRENTLY ON A ${goalStr.toUpperCase()} PROTOCOL. HIT 4 CORE COMPOUND MOVEMENTS TODAY WITH 3-4 SETS OF 8-12 REPS. FORCE PROGRESSIVE OVERLOAD!`;
        }
      } 
      else {
        reply = `RECEIVED, WARRIOR. AS A ${weightStr}KG ATHLETE IN ${goalStr.toUpperCase()} MODE, TARGET CALORIES ARE ${targets.calories} KCAL. LOG EVERYTHING YOU CONSUME AND HIT YOUR TARGETS!`;
      }

      setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className={`page-container animate-fade-in ${styles.aiPage}`}>
      <header className={styles.header}>
        <div>
          <span className="sticker">AI MATRIX</span>
          <h1 className="beast-title">AI GYM COACH</h1>
        </div>
        <Flame className={styles.flameIcon} size={28} />
      </header>

      <div className={`glass-panel ${styles.chatContainer}`}>
        <div className={styles.messages}>
          {chatHistory.map(msg => (
            <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.userWrapper : styles.aiWrapper}`}>
              <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.aiBubble}`}>
                {msg.sender === 'ai' && <div className={styles.coachTag}>COACH BOT</div>}
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={styles.typingIndicator}>
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className={styles.inputArea}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="ASK ABOUT RECIPES, TIMING, OR PRE-WORKOUT..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{ marginBottom: 0 }}
          />
          <button className={`btn btn-primary ${styles.sendBtn}`} onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
