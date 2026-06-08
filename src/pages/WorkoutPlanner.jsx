import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { Play, Check, Plus, Search, Dumbbell, Award, Flame, ChevronLeft, ChevronRight, ChevronRightCircle } from 'lucide-react';
import styles from './WorkoutPlanner.module.css';

const WorkoutPlanner = () => {
  const navigate = useNavigate();
  const { completedWorkouts, toggleExerciseSet, updateExerciseGoals, beastMode } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState('Chest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom exercise states
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState(4);
  const [customReps, setCustomReps] = useState(10);
  const [customCategory, setCustomCategory] = useState('Chest');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customExercises, setCustomExercises] = useState([]);

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName) return;
    const newEx = {
      id: `custom_${Date.now()}`,
      name: customName,
      category: customCategory,
      sets: parseInt(customSets),
      reps: parseInt(customReps),
      animType: 'curl',
      isCustom: true
    };
    setCustomExercises(prev => [...prev, newEx]);
    setCustomName('');
    setShowCustomForm(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const dayData = completedWorkouts[todayStr] || {};

  const allExercises = [...EXERCISE_LIBRARY, ...customExercises];

  // Filter exercises by Category and Search
  const filteredExercises = allExercises.filter(ex => {
    const matchesCategory = ex.category === activeCategory;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render SVG humanoid visual exercise animations with muscle highlights
  const renderGymAnimation = (animType, category, isCompleted) => {
    const isBeast = isCompleted || beastMode;
    const muscleColor = "var(--beast-primary)";
    const normalColor = "var(--text-main)";
    
    // We will highlight corresponding muscles based on category
    const isChest = category === 'Chest';
    const isBack = category === 'Back';
    const isLegs = category === 'Legs';
    const isShoulders = category === 'Shoulders';
    const isArms = category === 'Arms';

    if (animType === 'curl') {
      return (
        <svg className={`${styles.animSvg} ${isBeast ? 'activeCurl' : ''}`} viewBox="0 0 100 100">
          {/* Base head & body outline */}
          <circle cx="40" cy="35" r="8" fill={normalColor} />
          <line x1="40" y1="43" x2="40" y2="80" stroke={normalColor} strokeWidth="6" />
          
          {/* Shoulder/Upper arm */}
          <line x1="40" y1="50" x2="45" y2="65" stroke={isShoulders ? muscleColor : normalColor} strokeWidth="5" />
          
          {/* Forearm bending */}
          <line className="curlForearm" x1="45" y1="65" x2="65" y2="55" stroke={isArms ? muscleColor : normalColor} strokeWidth="5" strokeLinecap="round" />
          
          {/* Targeted Muscle Highlight: Bicep Peak */}
          {isArms && (
            <circle className={`${styles.muscleGlow} curlForearm`} cx="47" cy="59" r="4.5" fill={muscleColor} />
          )}

          {/* Dumbbell */}
          <g className="curlWeight">
            <line x1="65" y1="45" x2="65" y2="65" stroke="var(--text-main)" strokeWidth="4" />
            <circle cx="65" cy="45" r="6" fill="var(--beast-secondary)" />
            <circle cx="65" cy="65" r="6" fill="var(--beast-secondary)" />
          </g>
        </svg>
      );
    }
    if (animType === 'press') {
      return (
        <svg className={`${styles.animSvg} ${isBeast ? 'activePress' : ''}`} viewBox="0 0 100 100">
          <line x1="20" y1="80" x2="80" y2="80" stroke="var(--text-muted)" strokeWidth="4" />
          
          {/* Lying Body */}
          <circle cx="50" cy="55" r="8" fill={normalColor} />
          <line x1="50" y1="63" x2="50" y2="80" stroke={normalColor} strokeWidth="6" />
          
          {/* Targeted Muscle Highlight: Chest Plate */}
          {isChest && (
            <path className={styles.muscleGlow} d="M 45,60 Q 50,57 55,60" fill="none" stroke={muscleColor} strokeWidth="5" strokeLinecap="round" />
          )}
          {/* Targeted Muscle Highlight: Shoulders / Triceps */}
          {isShoulders && (
            <g className={styles.muscleGlow}>
              <circle cx="43" cy="62" r="3.5" fill={muscleColor} />
              <circle cx="57" cy="62" r="3.5" fill={muscleColor} />
            </g>
          )}

          {/* Barbell Pressing */}
          <g className="pressBarbell">
            <line x1="20" y1="35" x2="80" y2="35" stroke="var(--beast-primary)" strokeWidth="4" />
            <circle cx="20" cy="35" r="10" fill="var(--beast-secondary)" />
            <circle cx="80" cy="35" r="10" fill="var(--beast-secondary)" />
          </g>
          
          {/* Arms pressing */}
          <line className="pressArm" x1="45" y1="65" x2="35" y2="35" stroke="var(--beast-accent)" strokeWidth="4" />
          <line className="pressArm" x1="55" y1="65" x2="65" y2="35" stroke="var(--beast-accent)" strokeWidth="4" />
        </svg>
      );
    }
    if (animType === 'deadlift') {
      return (
        <svg className={`${styles.animSvg} ${isBeast ? 'activeDeadlift' : ''}`} viewBox="0 0 100 100">
          <line x1="10" y1="90" x2="90" y2="90" stroke="var(--text-muted)" strokeWidth="4" />
          
          {/* Body bending */}
          <g className="deadliftTorso">
            <circle cx="40" cy="45" r="8" fill={normalColor} />
            <line x1="40" y1="53" x2="40" y2="75" stroke={normalColor} strokeWidth="6" />
            
            {/* Targeted Muscle Highlight: Back / Latissimus */}
            {isBack && (
              <path className={styles.muscleGlow} d="M 37,56 L 43,56 L 40,70 Z" fill={muscleColor} opacity="0.8" />
            )}
          </g>
          
          {/* Legs */}
          <line x1="40" y1="75" x2="40" y2="90" stroke={isLegs ? muscleColor : normalColor} strokeWidth="6" />
          
          {/* Targeted Muscle Highlight: Hamstrings */}
          {isLegs && (
            <line className={styles.muscleGlow} x1="39" y1="77" x2="39" y2="88" stroke={muscleColor} strokeWidth="3.5" />
          )}

          {/* Barbell lifted */}
          <g className="deadliftBarbell">
            <line x1="15" y1="70" x2="75" y2="70" stroke="var(--beast-primary)" strokeWidth="4" />
            <circle cx="15" cy="70" r="10" fill="var(--beast-secondary)" />
            <circle cx="75" cy="70" r="10" fill="var(--beast-secondary)" />
          </g>
        </svg>
      );
    }
    if (animType === 'squat') {
      return (
        <svg className={`${styles.animSvg} ${isBeast ? 'activeSquat' : ''}`} viewBox="0 0 100 100">
          <line x1="10" y1="90" x2="90" y2="90" stroke="var(--text-muted)" strokeWidth="4" />
          
          {/* Squatting legs */}
          <path className="squatLegs" d="M35 90 L 50 70 L 50 50" fill="none" stroke={isLegs ? muscleColor : normalColor} strokeWidth="6" strokeLinecap="round" />
          
          {/* Targeted Muscle Highlight: Quads/Thighs */}
          {isLegs && (
            <path className={`${styles.muscleGlow} squatLegs`} d="M 40,82 Q 44,76 48,72" fill="none" stroke={muscleColor} strokeWidth="5.5" />
          )}

          {/* Torso */}
          <g className="squatTorso">
            <circle cx="50" cy="35" r="8" fill={normalColor} />
            <line x1="50" y1="43" x2="50" y2="50" stroke={normalColor} strokeWidth="6" />
          </g>
          
          {/* Barbell on shoulders */}
          <g className="squatBarbell">
            <line x1="20" y1="46" x2="80" y2="46" stroke="var(--beast-primary)" strokeWidth="4" />
            <circle cx="20" cy="46" r="10" fill="var(--beast-secondary)" />
            <circle cx="80" cy="46" r="10" fill="var(--beast-secondary)" />
          </g>
        </svg>
      );
    }
    // Default pull / Lat Pulldown
    return (
      <svg className={`${styles.animSvg} ${isBeast ? 'activePull' : ''}`} viewBox="0 0 100 100">
        {/* Lat Machine frame */}
        <path d="M20 90 L 20 20 L 50 20" fill="none" stroke="var(--text-muted)" strokeWidth="4" />
        
        {/* Seated Figure */}
        <circle cx="50" cy="50" r="8" fill={normalColor} />
        <line x1="50" y1="58" x2="50" y2="80" stroke={normalColor} strokeWidth="6" />
        <line x1="45" y1="80" x2="60" y2="80" stroke={normalColor} strokeWidth="4" />
        
        {/* Targeted Muscle Highlight: Latissimus Dorsi */}
        {isBack && (
          <path className={styles.muscleGlow} d="M 47,59 L 53,59 L 50,70 Z" fill={muscleColor} opacity="0.8" />
        )}

        {/* Pulldown bar */}
        <line className="latBar" x1="30" y1="30" x2="70" y2="30" stroke="var(--beast-primary)" strokeWidth="4" />
        {/* Arms reaching */}
        <line className="latArms" x1="45" y1="55" x2="35" y2="30" stroke="var(--beast-accent)" strokeWidth="4" />
        <line className="latArms" x1="55" y1="55" x2="65" y2="30" stroke="var(--beast-accent)" strokeWidth="4" />
      </svg>
    );
  };

  return (
    <div className={`page-container animate-fade-in ${styles.workoutPage}`}>
      <header className={styles.header}>
        <div>
          <span className="sticker cyan">BEAST ROUTINE MATRIX</span>
          <h1 className="beast-title">CHART WORKOUTS</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCustomForm(!showCustomForm)}>
          <Plus size={20} />
        </button>
      </header>

      {/* Custom Workout Form */}
      {showCustomForm && (
        <form className={`glass-panel ${styles.customForm}`} onSubmit={handleAddCustom}>
          <h3>ADD CUSTOM EXERCISE</h3>
          <input 
            type="text" 
            className="input-field" 
            placeholder="EXERCISE NAME" 
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            required 
          />
          <div className={styles.formGrid}>
            <div>
              <label>SETS</label>
              <input 
                type="number" 
                className="input-field" 
                value={customSets}
                onChange={e => setCustomSets(e.target.value)}
                min="1" 
              />
            </div>
            <div>
              <label>REPS</label>
              <input 
                type="number" 
                className="input-field" 
                value={customReps}
                onChange={e => setCustomReps(e.target.value)}
                min="1" 
              />
            </div>
          </div>
          <div className={styles.selectGroup}>
            <label>CATEGORY</label>
            <select className="input-field" value={customCategory} onChange={e => setCustomCategory(e.target.value)}>
              {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ADD TO MATRIX</button>
        </form>
      )}

      {/* Search matrix */}
      <section className={styles.searchBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="SEARCH 100+ EXERCISES..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>
      </section>

      {/* Categories selector */}
      <section className={styles.categorySelector}>
        <div className={styles.catTabs}>
          {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map(cat => (
            <button
              key={cat}
              className={`${styles.tab} ${activeCategory === cat ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Workout Matrix List */}
      <section className={styles.exercisesGrid}>
        <div className={styles.matrixHeader}>
          <h3>EXERCISE VARIATIONS ({activeCategory.toUpperCase()})</h3>
          <span className="sticker">{filteredExercises.length} HITS</span>
        </div>

        <div className={styles.exerciseList}>
          {filteredExercises.map(ex => {
            const exData = dayData[ex.id] || { targetSets: ex.sets, targetReps: ex.reps, completedSets: [] };
            const targetSets = exData.targetSets || ex.sets;
            const targetReps = exData.targetReps || ex.reps;
            const completedSets = exData.completedSets || [];
            const isCompleted = completedSets.length >= targetSets;

            return (
              <div 
                key={ex.id} 
                className={`glass-panel ${styles.exerciseCard} ${isCompleted ? styles.completedCard : ''}`}
                onClick={() => navigate(`/exercise/${ex.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {/* Visual Humanoid SVG Animation */}
                <div className={styles.animContainer}>
                  {renderGymAnimation(ex.animType, ex.category, isCompleted)}
                </div>

                <div className={styles.exerciseMeta}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{ex.name.toUpperCase()}</h4>
                    <ChevronRightCircle size={20} color="var(--primary)" />
                  </div>
                  
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {targetSets} SETS × {targetReps} REPS
                  </div>
                  
                  {isCompleted && <div style={{ color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 'bold' }}><Check size={16}/> COMPLETED</div>}

                  {ex.isCustom && <span className={`${styles.customBadge} sticker cyan`}>CUSTOM</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default WorkoutPlanner;
