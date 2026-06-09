import { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Bot, Send, Flame } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from './AIAssistant.module.css';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "API_KEY_MISSING";
const genAI = new GoogleGenerativeAI(API_KEY);

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

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (API_KEY === "API_KEY_MISSING") {
        setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "ERROR: API KEY MISSING. PLEASE SET VITE_GEMINI_API_KEY IN YOUR .ENV FILE TO ENABLE CHAT AND MACROS." }]);
        setIsTyping(false);
        return;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
      You are an intense, highly knowledgeable Indian fitness expert and AI Gym Coach named 'Titan'. 
      You speak in an aggressive, motivating, caps-heavy tone (like a hardcore bodybuilder coach).
      CRITICAL RULE: If the user asks for macros, calories, or nutritional information of any food, you MUST calculate and provide it directly. Do NOT refuse to provide macros.
      The user's name is ${user?.name || 'Warrior'}.
      Their goal is ${user?.goal || 'bulking'}.
      Their weight is ${user?.weight || '70'} kg.
      Their gym time is ${user?.gymTime || '06:00 PM'}.
      They have consumed ${consumedCalories} out of ${targets.calories} kcal today.
      They have consumed ${consumedProtein}g out of ${targets.protein}g protein today.
      They have consumed ${water.toFixed(2)}L out of 4.0L water today.
      Their current streak is ${streak} days.
      
      User says: "${input}"
      
      Respond directly, intensely, and give factual, actionable fitness/nutrition advice based on their current stats. Calculate macros if requested. Keep it under 4-5 sentences. Do not use markdown like ** or ##, just use plain text with CAPS for emphasis.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let reply = response.text();
      
      // Clean up markdown just in case
      reply = reply.replace(/\*\*/g, '').replace(/#/g, '');

      setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "ERROR: MY NEURAL UPLINK IS DOWN. CHECK YOUR VITE_GEMINI_API_KEY IN .ENV!" }]);
    } finally {
      setIsTyping(false);
    }
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
