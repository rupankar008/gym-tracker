import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Apple, Bot, Pill, Activity } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  return (
    <nav className={styles.bottomNav}>
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/workout" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
        <Dumbbell size={22} />
        <span>Workout</span>
      </NavLink>
      <NavLink to="/diet" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
        <Apple size={22} />
        <span>Diet</span>
      </NavLink>
      <NavLink to="/progress" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
        <Activity size={22} />
        <span>Progress</span>
      </NavLink>
      <NavLink to="/supplements" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
        <Pill size={22} />
        <span>Supps</span>
      </NavLink>
      <NavLink to="/ai-assistant" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
        <Bot size={22} />
        <span>AI</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
