import { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import WorkoutPlanner from './pages/WorkoutPlanner';
import DietPlan from './pages/DietPlan';
import AIAssistant from './pages/AIAssistant';
import Auth from './pages/Auth';
import ExerciseDetail from './pages/ExerciseDetail';
import BottomNav from './components/BottomNav';
import './App.css';

function AppContent() {
  const { user, beastMode } = useContext(AppContext);

  useEffect(() => {
    if (beastMode) {
      document.body.classList.add('beast-mode-active');
    } else {
      document.body.classList.remove('beast-mode-active');
    }
  }, [beastMode]);

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
