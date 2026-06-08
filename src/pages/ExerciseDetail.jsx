import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { ChevronLeft, Info, AlertTriangle, Crosshair, ListPlus, Check } from 'lucide-react';
import styles from './ExerciseDetail.module.css';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completedWorkouts, toggleExerciseSet, updateExerciseGoals, beastMode } = useContext(AppContext);
  
  // Try to find in library, or assume it's custom if handled by context (not strictly implemented custom passing via URL here, but keeping it simple)
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id) || {
    id, name: 'Custom Exercise', category: 'General', sets: 4, reps: 10, animType: 'curl'
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const exData = (completedWorkouts[todayStr] && completedWorkouts[todayStr][id]) || { targetSets: exercise.sets, targetReps: exercise.reps, completedSets: [] };
  const targetSets = exData.targetSets || exercise.sets;
  const targetReps = exData.targetReps || exercise.reps;
  const completedSets = exData.completedSets || [];
  const isCompleted = completedSets.length >= targetSets;

  // Mock Content Generator
  const getDetails = (cat) => {
    switch(cat) {
      case 'Chest': return {
        muscles: 'Pectoralis Major, Anterior Deltoids, Triceps',
        desc: 'A compound pushing movement that builds overall upper body strength and mass.',
        precautions: 'Keep shoulders retracted. Avoid flaring elbows out 90 degrees to protect rotator cuffs.',
        form: '1. Plant feet firmly. 2. Arch lower back slightly. 3. Lower weight to mid-chest. 4. Press up explosively.',
        alt: 'Push-ups, Dumbbell Press, Machine Press'
      };
      case 'Back': return {
        muscles: 'Latissimus Dorsi, Rhomboids, Trapezius, Biceps',
        desc: 'A pulling movement designed to thicken and widen the back muscles.',
        precautions: 'Maintain a neutral spine. Do not round your lower back when pulling from the floor.',
        form: '1. Hinge at hips. 2. Keep chest up. 3. Pull weight to belly button. 4. Squeeze shoulder blades together.',
        alt: 'Pull-ups, Seated Cable Rows, T-Bar Rows'
      };
      case 'Legs': return {
        muscles: 'Quadriceps, Hamstrings, Glutes, Calves',
        desc: 'The foundation of lower body power, targeting the largest muscle groups in the body.',
        precautions: 'Do not let knees cave inward. Keep weight evenly distributed on the mid-foot/heel.',
        form: '1. Feet shoulder-width apart. 2. Push hips back. 3. Keep chest proud. 4. Drive through heels.',
        alt: 'Leg Press, Lunges, Goblet Squats'
      };
      case 'Shoulders': return {
        muscles: 'Anterior, Lateral, and Posterior Deltoids',
        desc: 'An essential movement for developing broad shoulders and upper body stability.',
        precautions: 'Avoid using excessive momentum. Control the eccentric (lowering) portion.',
        form: '1. Brace core. 2. Press straight up overhead. 3. Do not hyperextend lower back.',
        alt: 'Arnold Press, Lateral Raises, Front Raises'
      };
      case 'Arms': return {
        muscles: 'Biceps Brachii, Brachialis, Triceps Brachii',
        desc: 'Isolation movements to maximize the size and peak of the arm muscles.',
        precautions: 'Keep elbows pinned to your sides. Do not swing your torso to move the weight.',
        form: '1. Stand tall. 2. Curl weight up while supinating wrist. 3. Squeeze at the top. 4. Lower slowly.',
        alt: 'Hammer Curls, Tricep Pushdowns, Preacher Curls'
      };
      default: return {
        muscles: 'Multiple Muscle Groups',
        desc: 'General physical preparedness movement.',
        precautions: 'Perform with controlled motion.',
        form: '1. Setup correctly. 2. Execute movement safely. 3. Return to start.',
        alt: 'Similar compound movements'
      };
    }
  };

  const details = getDetails(exercise.category);

  return (
    <div className={`page-container animate-fade-in ${styles.detailPage}`}>
      <header className={styles.header}>
        <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ padding: '0.5rem' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="beast-title" style={{ fontSize: '1.2rem', margin: 0, marginLeft: '1rem' }}>{exercise.name.toUpperCase()}</h2>
      </header>

      <div className={styles.content}>
        {/* Tracker Section */}
        <div className={`glass-panel ${styles.trackerPanel}`}>
          <h3>TODAY'S GOAL</h3>
          
          <div className={styles.goalsController}>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>SETS:</span>
              <button className={styles.adjustBtn} onClick={() => updateExerciseGoals(todayStr, exercise.id, Math.max(1, targetSets - 1), targetReps)}>-</button>
              <span className={styles.controlVal}>{targetSets}</span>
              <button className={styles.adjustBtn} onClick={() => updateExerciseGoals(todayStr, exercise.id, targetSets + 1, targetReps)}>+</button>
            </div>
            
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>REPS:</span>
              <button className={styles.adjustBtn} onClick={() => updateExerciseGoals(todayStr, exercise.id, targetSets, Math.max(1, targetReps - 1))}>-</button>
              <span className={styles.controlVal}>{targetReps}</span>
              <button className={styles.adjustBtn} onClick={() => updateExerciseGoals(todayStr, exercise.id, targetSets, targetReps + 1)}>+</button>
            </div>
          </div>

          <div className={styles.setBubbles}>
            {Array.from({ length: targetSets }).map((_, i) => {
              const setNum = i + 1;
              const isSetDone = completedSets.includes(setNum);
              return (
                <button
                  key={setNum}
                  className={`${styles.setBubble} ${isSetDone ? styles.setBubbleDone : ''}`}
                  onClick={() => toggleExerciseSet(todayStr, exercise.id, setNum, targetSets, targetReps)}
                >
                  {isSetDone ? <Check size={16} /> : setNum}
                </button>
              );
            })}
          </div>
          {isCompleted && <div className={styles.completedBadge}><Check size={16}/> SETS COMPLETED</div>}
        </div>

        {/* Info Sections */}
        <div className={`glass-panel ${styles.infoPanel}`}>
          <div className={styles.infoRow}>
            <Crosshair className={styles.infoIcon} size={20} />
            <div>
              <h4>TARGET MUSCLES</h4>
              <p>{details.muscles}</p>
            </div>
          </div>
          
          <div className={styles.infoRow}>
            <Info className={styles.infoIcon} size={20} />
            <div>
              <h4>DESCRIPTION</h4>
              <p>{details.desc}</p>
            </div>
          </div>
          
          <div className={styles.infoRow}>
            <AlertTriangle className={styles.infoIcon} size={20} style={{color: 'var(--accent)'}} />
            <div>
              <h4>PRECAUTIONS</h4>
              <p>{details.precautions}</p>
            </div>
          </div>

          <div className={styles.infoRow}>
            <ListPlus className={styles.infoIcon} size={20} />
            <div>
              <h4>CORRECT FORM</h4>
              <p>{details.form}</p>
            </div>
          </div>

          <div className={styles.infoRow}>
            <ListPlus className={styles.infoIcon} size={20} />
            <div>
              <h4>ALTERNATIVES</h4>
              <p>{details.alt}</p>
            </div>
          </div>
        </div>

        <button className={`btn btn-primary ${styles.addToChartBtn}`}>
          ADD TO CUSTOM CHART
        </button>
      </div>
    </div>
  );
};

export default ExerciseDetail;
