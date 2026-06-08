import { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import WorkoutPlanner from './pages/WorkoutPlanner';
import DietPlan from './pages/DietPlan';
import AIAssistant from './pages/AIAssistant';
import Auth from './pages/Auth';
import ExerciseDetail from './pages/ExerciseDetail';
import BottomNav from './components/BottomNav';
import { Flame, Droplets, Dumbbell } from 'lucide-react';
import './App.css';

const NOTIFICATIONS = [
  { icon: Flame, text: "TIME TO HYDRATE: Drink a glass of water!" },
  { icon: Droplets, text: "PRO-TIP: Keep your back straight during deadlifts." },
  { icon: Dumbbell, text: "QUICK MEAL: Try 3 boiled eggs for a quick 18g of protein." },
  { icon: Flame, text: "LIFT HEAVY OR GO HOME! Push your limits today." },
  { icon: Dumbbell, text: "FORM CHECK: Don't let your knees cave in on squats." },
  { icon: Droplets, text: "RECOVERY: Stretch out those hamstrings tonight!" }
];

function AppContent() {
  const { user, beastMode } = useContext(AppContext);
  const [toast, setToast] = useState({ show: false, msg: null });

  useEffect(() => {
    if (beastMode) {
      document.body.classList.add('beast-mode-active');
    } else {
      document.body.classList.remove('beast-mode-active');
    }
  }, [beastMode]);

  // Random Notification Engine
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      // 30% chance to show a notification every minute
      if (Math.random() > 0.7) {
        const randomNotif = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
        setToast({ show: true, msg: randomNotif });
        setTimeout(() => {
          setToast(prev => ({ ...prev, show: false }));
        }, 5000); // hide after 5 seconds
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <div className={`app-container ${beastMode ? 'beast-shake' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutPlanner />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/diet" element={<DietPlan />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Routes>
        <BottomNav />
        
        {/* Global Toast Notification */}
        <div className={`toast-notification ${toast.show ? 'show' : ''}`}>
          {toast.msg && <toast.msg.icon className="toast-icon" size={24} />}
          <span>{toast.msg?.text}</span>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
