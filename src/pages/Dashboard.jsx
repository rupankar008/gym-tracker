import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import BodybuilderLogo from '../components/BodybuilderLogo';
import { Flame, Trophy, Droplets, LogOut, Swords, Star, Dumbbell, Clock, Bell, Camera, Image as ImageIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './Dashboard.module.css';

const quotes = [
  "Suffer the pain of discipline or suffer the pain of regret.",
  "LIGHTWEIGHT BABY! AIN'T NOTHING BUT A PEANUT!",
  "The only bad workout is the one that didn't happen.",
  "You don't get the ass you want by sitting on it.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "When you feel like quitting, think about why you started."
];

const calorieData = [
  { day: 'Mon', calories: 1800 },
  { day: 'Tue', calories: 2200 },
  { day: 'Wed', calories: 2500 },
  { day: 'Thu', calories: 2100 },
  { day: 'Fri', calories: 2700 },
  { day: 'Sat', calories: 2900 },
  { day: 'Sun', calories: 2400 },
];

const Dashboard = () => {
  const { 
    user, 
    logout, 
    updateUser,
    streak, 
    water, 
    setWater, 
    beastMode, 
    beastTimerActive, 
    beastCountdown, 
    triggerBeastMode, 
    meals, 
    targets,
    getMuscleVolumeData
  } = useContext(AppContext);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [beastPressed, setBeastPressed] = useState(false);

  const rotateQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  const handleBeastToggle = () => {
    setBeastPressed(true);
    setTimeout(() => setBeastPressed(false), 300);
    triggerBeastMode(!beastMode && !beastTimerActive);
  };

  const consumedCalories = meals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0);
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // aggressively compress
        
        const currentPhotos = user?.progressPhotos || [];
        const newPhoto = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          url: dataUrl
        };
        
        updateUser({ progressPhotos: [...currentPhotos, newPhoto] });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const muscleVolume = getMuscleVolumeData(todayStr);

  return (
    <div className={`page-container ${styles.dashboard}`}>
      {/* 5-Second Beast Mode Countdown Overlay */}
      {beastTimerActive && (
        <div className={styles.countdownOverlay}>
          <div className={styles.countdownBox}>
            <Flame className={styles.pulseFlame} size={60} />
            <h1 className={styles.countdownTitle}>UNLEASHING BEAST MODE IN</h1>
            <div className={styles.countdownNumber}>{beastCountdown}</div>
            <p className={styles.countdownSub}>PREPARE TO LIFT HEAVY...</p>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.logoTitle}>
          <BodybuilderLogo size={55} className={styles.bicepsLogo} />
          <div>
            <span className="sticker">TITAN WARRIOR</span>
            <h1 className="beast-title">{user?.name?.toUpperCase()}</h1>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Exit Beast Mode">
          <LogOut size={20} />
        </button>
      </header>

      {/* User Parameters Details & Preferred Gym Time */}
      <section className={`glass-panel ${styles.profileParamsPanel}`}>
        <div className={styles.paramsGrid}>
          <div>
            <span className={styles.paramLabel}>CURRENT WEIGHT</span>
            <div className={styles.paramVal} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input 
                type="number" 
                value={user?.weight || ''} 
                onChange={(e) => updateUser({ weight: e.target.value })}
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold', outline: 'none', width: '50px' }}
              /> kg
            </div>
          </div>
          <div>
            <span className={styles.paramLabel}>TARGET WEIGHT</span>
            <div className={styles.paramVal} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input 
                type="number" 
                value={user?.targetWeight || ''} 
                onChange={(e) => updateUser({ targetWeight: e.target.value })}
                placeholder="-"
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold', outline: 'none', width: '50px' }}
              /> kg
            </div>
          </div>
          <div>
            <span className={styles.paramLabel}>MISSION / GOAL</span>
            <select 
              className={styles.paramVal}
              value={user?.goal || 'bulking'}
              onChange={(e) => updateUser({ goal: e.target.value })}
              style={{ color: 'var(--beast-primary)', background: 'transparent', border: 'none', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold', outline: 'none', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="bulking" style={{background: '#111'}}>BULKING</option>
              <option value="cutting" style={{background: '#111'}}>CUTTING</option>
              <option value="maintaining" style={{background: '#111'}}>MAINTAINING</option>
            </select>
          </div>
          <div>
            <span className={styles.paramLabel}>CUSTOM CALORIES</span>
            <div className={styles.paramVal} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input 
                type="number" 
                value={user?.customCalories || ''} 
                onChange={(e) => updateUser({ customCalories: e.target.value })}
                placeholder={targets.calories.toString()}
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold', outline: 'none', width: '60px' }}
              /> kcal
            </div>
          </div>
          <div>
            <span className={styles.paramLabel}>GYM TIME</span>
            <div className={styles.paramVal} style={{ color: 'var(--beast-accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} /> 
              <input 
                type="time" 
                value={user?.gymTime || '18:00'} 
                onChange={(e) => updateUser({ gymTime: e.target.value })}
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Actionable Reminders Based on Custom Gym Time */}
      <section className={`glass-panel ${styles.remindersPanel}`} style={{ marginTop: '1rem', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Bell size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>UPCOMING REMINDERS</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
          {user?.gymTime ? (() => {
            const [h, m] = user.gymTime.split(':').map(Number);
            let d = new Date();
            d.setHours(h, m, 0);
            d.setMinutes(d.getMinutes() - 90);
            return `Take Pre-Workout & Creatine at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (90 mins before lift)!`;
          })() : 'Set your gym time to get supplement reminders!'}
        </p>
      </section>

      {/* Beast Mode Activation - Premium Power Button */}
      <section className={`glass-panel ${styles.beastModePanel} ${beastMode ? styles.activeBeast : ''}`}>
        <div className={styles.beastHeader}>
          <div className={styles.beastTextBlock}>
            <span className={styles.beastLabel}>{beastMode ? '⚡ BEAST MODE ON' : 'BEAST MODE'}</span>
            <p className={styles.beastSub}>{beastMode ? 'Every rep counts. Lift heavy.' : beastTimerActive ? `Activating in ${beastCountdown}...` : 'Tap to ignite your inner beast'}</p>
          </div>

          {/* Power Button */}
          <button
            className={`${styles.powerBtn} ${beastMode ? styles.powerOn : ''} ${beastTimerActive ? styles.powerArming : ''} ${beastPressed ? styles.powerPressed : ''}`}
            onClick={handleBeastToggle}
            disabled={beastTimerActive}
            aria-label="Toggle Beast Mode"
          >
            <span className={styles.powerRing1} />
            <span className={styles.powerRing2} />
            <Swords size={24} className={styles.powerIcon} />
          </button>
        </div>

        {/* Active Beast Status Bar */}
        {beastMode && (
          <div className={styles.beastActiveBar}>
            <div className={styles.beastActiveInner} />
          </div>
        )}
      </section>

      {/* Dynamic Motivation Quotes */}
      <section className={`glass-panel ${styles.quoteCard}`} onClick={rotateQuote}>
        <span className="sticker cyan">MOTIVATION</span>
        <p className={styles.quoteText}>"{quotes[quoteIdx]}"</p>
        <span className={styles.tapTip}>Tap to rotate wisdom</span>
      </section>

      {/* Daily metrics */}
      <section className={styles.metricsRow}>
        <div className={`glass-panel ${styles.metricCard}`}>
          <Flame size={28} className={styles.flame} />
          <h4>DAILY STREAK</h4>
          <p className={styles.val}>{streak} DAYS</p>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <Trophy size={28} className={styles.trophy} />
          <h4>TODAY'S FUEL</h4>
          <p className={styles.val}>{consumedCalories} / {targets.calories} kcal</p>
        </div>
      </section>

      {/* Muscle Group Targeted Volume Graph */}
      <section className={`glass-panel ${styles.chartCard}`}>
        <h3>MUSCLE TARGET DISTRIBUTION (SETS LOGGED TODAY)</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={muscleVolume}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--panel-dark)', border: '1px solid var(--beast-accent)', borderRadius: '6px', color: '#fff' }} 
                cursor={{ fill: 'rgba(255, 69, 0, 0.05)' }}
              />
              <Bar dataKey="sets" radius={[4, 4, 0, 0]}>
                {muscleVolume.map((entry, index) => {
                  const colors = ['#ff4500', '#ff0055', '#00ffd5', '#ffaa00', '#9900ff'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Water Tracker */}
      <section className={`glass-panel ${styles.waterPanel}`}>
        <div className={styles.waterInfo}>
          <Droplets size={28} color="var(--beast-accent)" />
          <div>
            <h3>HYDRATION TARGET</h3>
            <p className={styles.val}>{water.toFixed(2)} / 4.0 LITERS</p>
          </div>
        </div>
        <div className={styles.waterControls}>
          <button className="btn btn-secondary" onClick={() => setWater(prev => Math.max(0, prev - 0.25))}>-250ML</button>
          <button className="btn btn-primary" onClick={() => setWater(prev => prev + 0.25)}>+250ML</button>
        </div>
      </section>

      {/* Achievements Badges */}
      <section className={`glass-panel ${styles.badgesPanel}`}>
        <h3>BEAST MILESTONES</h3>
        <div className={styles.badgeList}>
          {streak >= 5 && (
            <div className={styles.badgeItem}>
              <Star size={16} />
              <span>Iron Warrior</span>
            </div>
          )}
          {consumedCalories >= targets.calories * 0.8 && (
            <div className={styles.badgeItem}>
              <Star size={16} />
              <span>Mass Monster</span>
            </div>
          )}
          <div className={`${styles.badgeItem} ${styles.cyanBadge}`}>
            <Dumbbell size={14} />
            <span>Heavy Lifter</span>
          </div>
        </div>
      </section>

      {/* Photo Progress Timeline */}
      <section className={`glass-panel ${styles.progressCard}`} style={{ borderLeft: '4px solid var(--beast-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>PROGRESS TIMELINE</h3>
          <label className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}>
            <Camera size={16} style={{ marginRight: '0.25rem' }} /> UPLOAD
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>
        
        {(!user?.progressPhotos || user.progressPhotos.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <ImageIcon size={40} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.9rem' }}>Upload your first physique update to start tracking visual progress!</p>
          </div>
        ) : (
          <div className={styles.photoTimeline} style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {user.progressPhotos.map((photo) => (
              <div key={photo.id} style={{ flexShrink: 0, position: 'relative' }}>
                <img 
                  src={photo.url} 
                  alt="Progress" 
                  style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--beast-secondary)' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.25rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {photo.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fuel Intake Chart */}
      <section className={`glass-panel ${styles.chartCard}`}>
        <h3>FUEL INTAKE WORKLINE</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={calorieData}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--beast-primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--beast-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--panel-dark)', border: '1px solid var(--beast-primary)', borderRadius: '6px', color: 'var(--text-main)' }} 
                itemStyle={{ color: 'var(--beast-primary)' }}
              />
              <Area type="monotone" dataKey="calories" stroke="var(--beast-primary)" fillOpacity={1} fill="url(#colorCalories)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>TitanFit | Developed by Rupankar &lt;3</p>
      </footer>
    </div>
  );
};

export default Dashboard;
