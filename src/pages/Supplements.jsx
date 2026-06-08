import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Bell, Plus, Check, Trash2, Flame, Star, Pill, BellRing, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Supplements.module.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Safe notification permission check
const getNotifPermission = () => {
  try {
    return typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  } catch { return 'denied'; }
};
const notifSupported = typeof Notification !== 'undefined';

// All available supplement presets
const SUPPLEMENT_PRESETS = [
  { name: 'Creatine Monohydrate', dose: '5g', timing: 'post-workout', icon: '💪', color: '#ff4500' },
  { name: 'Whey Protein', dose: '1 scoop (30g)', timing: 'post-workout', icon: '🥛', color: '#ff0055' },
  { name: 'Multivitamin', dose: '1 tablet', timing: 'morning', icon: '🌟', color: '#ffaa00' },
  { name: 'Fish Oil / Omega-3', dose: '2 capsules', timing: 'morning', icon: '🐟', color: '#00ffd5' },
  { name: 'Pre-Workout', dose: '1 scoop', timing: 'pre-workout', icon: '⚡', color: '#9900ff' },
  { name: 'BCAA', dose: '5-10g', timing: 'during-workout', icon: '🧬', color: '#0088ff' },
  { name: 'Vitamin D3', dose: '2000 IU', timing: 'morning', icon: '☀️', color: '#ffcc00' },
  { name: 'Magnesium', dose: '400mg', timing: 'night', icon: '😴', color: '#6644ff' },
  { name: 'Ashwagandha', dose: '300-600mg', timing: 'night', icon: '🌿', color: '#44aa44' },
  { name: 'Zinc', dose: '25mg', timing: 'night', icon: '🔬', color: '#888888' },
];

const TIMING_LABELS = {
  'morning': '☀️ MORNING',
  'pre-workout': '⚡ PRE-WORKOUT',
  'post-workout': '💪 POST-WORKOUT',
  'during-workout': '🏋️ DURING WORKOUT',
  'night': '🌙 NIGHT',
};

const getSmartTime = (timing, gymTime) => {
  if (!gymTime) return null;
  const [h, m] = gymTime.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0);

  if (timing === 'pre-workout') {
    date.setMinutes(date.getMinutes() - 30);
  } else if (timing === 'post-workout') {
    date.setMinutes(date.getMinutes() + 15);
  } else if (timing === 'morning') {
    return '8:00 AM';
  } else if (timing === 'night') {
    return '10:00 PM';
  } else if (timing === 'during-workout') {
    return `During your ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} session`;
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Supplements = () => {
  const { user, supplements, addSupplement, deleteSupplement, toggleSupplementTaken, isSupplementTakenToday } = useContext(AppContext);

  const [showPresets, setShowPresets] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDose, setCustomDose] = useState('');
  const [customTiming, setCustomTiming] = useState('morning');
  const [aiRec, setAiRec] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [notifGranted, setNotifGranted] = useState(() => getNotifPermission() === 'granted');

  const requestNotifications = async () => {
    if (!notifSupported) return;
    try {
      const perm = await Notification.requestPermission();
      setNotifGranted(perm === 'granted');
      if (perm === 'granted') {
        new Notification('TitanFit 🔥', {
          body: "Supplement reminders are now active!",
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
  };

  // Schedule smart notifications based on gym time + supplements
  useEffect(() => {
    if (!notifGranted || !user?.gymTime || supplements.length === 0) return;

    const checkAndNotify = () => {
      const now = new Date();
      const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

      supplements.forEach(supp => {
        if (isSupplementTakenToday(supp.id)) return;

        const smartTime = getSmartTime(supp.timing, user.gymTime);
        if (!smartTime || smartTime.includes('During')) return;

        // Convert to 24h for comparison
        const [timePart, meridiem] = smartTime.split(' ');
        let [sh, sm] = timePart.split(':').map(Number);
        if (meridiem === 'PM' && sh !== 12) sh += 12;
        if (meridiem === 'AM' && sh === 12) sh = 0;
        const targetTime = `${sh}:${String(sm).padStart(2, '0')}`;

        if (currentTime === targetTime) {
          new Notification(`TitanFit Supplement Alert 💊`, {
            body: `TIME TO TAKE: ${supp.name} (${supp.dose})`,
            icon: '/favicon.ico'
          });
        }
      });
    };

    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [notifGranted, supplements, user?.gymTime]);

  const handleAddPreset = (preset) => {
    const already = supplements.find(s => s.name === preset.name);
    if (already) return alert(`${preset.name} is already in your stack!`);
    addSupplement({ ...preset });
    setShowPresets(false);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName || !customDose) return;
    addSupplement({
      name: customName,
      dose: customDose,
      timing: customTiming,
      icon: '💊',
      color: '#ff4500',
      isCustom: true
    });
    setCustomName('');
    setCustomDose('');
    setShowCustomForm(false);
  };

  const loadAiRecommendations = async () => {
    if (!genAI || !user) return;
    setAiLoading(true);
    setAiRec('');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      const prompt = `You are an Indian sports nutrition expert. Based on the following athlete profile, recommend a supplement stack with dosage and timing. Be specific, direct, and motivating. Max 5 supplements, explain WHY each one suits this person. Keep it under 200 words, no markdown just plain text.

Athlete Profile:
- Name: ${user.name}
- Goal: ${user.goal} 
- Experience: ${user.experience || 'beginner'}
- Gym Frequency: ${user.gymFrequency || 3} days/week
- Diet: ${user.diet}
- Weight: ${user.weight}kg
- Age: ${user.age}`;

      const result = await model.generateContent(prompt);
      setAiRec(result.response.text());
    } catch (e) {
      setAiRec('Error loading AI recommendations. Check your API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const takenToday = supplements.filter(s => isSupplementTakenToday(s.id)).length;

  return (
    <div className={`page-container animate-fade-in ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <span className="sticker">SUPPLEMENT STACK</span>
          <h1 className="beast-title">MY SUPPLEMENTS</h1>
        </div>
        <Pill size={28} color="var(--beast-primary)" />
      </header>

      {/* Daily Progress Banner */}
      <section className={`glass-panel ${styles.progressBanner}`}>
        <div className={styles.progressInfo}>
          <div className={styles.progressStat}>
            <span className={styles.statNum}>{takenToday}</span>
            <span className={styles.statLabel}>TAKEN TODAY</span>
          </div>
          <div className={styles.progressDivider} />
          <div className={styles.progressStat}>
            <span className={styles.statNum}>{supplements.length}</span>
            <span className={styles.statLabel}>IN STACK</span>
          </div>
          <div className={styles.progressDivider} />
          <div className={styles.progressStat}>
            <span className={styles.statNum} style={{ color: takenToday === supplements.length && supplements.length > 0 ? 'var(--beast-accent)' : 'var(--beast-primary)' }}>
              {supplements.length > 0 ? Math.round((takenToday / supplements.length) * 100) : 0}%
            </span>
            <span className={styles.statLabel}>COMPLETE</span>
          </div>
        </div>
        {takenToday === supplements.length && supplements.length > 0 && (
          <div className={styles.allDoneBanner}>🔥 FULL STACK TAKEN! BEAST MODE ACTIVATED!</div>
        )}
      </section>

      {/* Notifications Toggle */}
      {!notifGranted && (
        <section className={`glass-panel ${styles.notifCard}`} style={{ borderLeft: '4px solid var(--beast-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BellRing size={24} color="var(--beast-accent)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem' }}>ENABLE SMART REMINDERS</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Get browser notifications when it's time to take each supplement
              </p>
            </div>
          </div>
          {notifSupported ? (
            <button className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%' }} onClick={requestNotifications}>
              <Bell size={16} /> ENABLE NOTIFICATIONS
            </button>
          ) : (
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--beast-accent)', padding: '0.5rem', background: 'rgba(255,69,0,0.1)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
              ⚠️ iOS Users: To enable notifications, tap the Share icon below and select "Add to Home Screen".
            </div>
          )}
        </section>
      )}

      {/* AI Recommendation */}
      <section className={`glass-panel ${styles.aiCard}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Sparkles size={18} color="var(--beast-accent)" /> AI SUPPLEMENT COACH
          </h3>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={loadAiRecommendations} disabled={aiLoading}>
            {aiLoading ? 'ANALYZING...' : 'GET MY STACK'}
          </button>
        </div>
        {aiLoading && (
          <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem 0' }}>
            <div className={styles.dot} /><div className={styles.dot} style={{ animationDelay: '0.2s' }} /><div className={styles.dot} style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        {aiRec && (
          <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-line', marginTop: '0.5rem' }}>{aiRec}</p>
        )}
        {!aiRec && !aiLoading && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tap "GET MY STACK" and I'll build a personalized supplement plan based on your goal ({user?.goal}), experience ({user?.experience || 'beginner'}), and {user?.gymFrequency || 3}x/week frequency!
          </p>
        )}
      </section>

      {/* Daily Supplement Cards */}
      <section className={styles.stackSection}>
        <h3 className={styles.sectionTitle}>TODAY'S STACK</h3>
        {supplements.length === 0 ? (
          <div className={`glass-panel ${styles.emptyState}`}>
            <Pill size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
            <p>Your stack is empty! Add supplements from presets or create your own.</p>
          </div>
        ) : (
          <div className={styles.suppList}>
            {supplements.map(supp => {
              const taken = isSupplementTakenToday(supp.id);
              const smartTime = getSmartTime(supp.timing, user?.gymTime);
              return (
                <div key={supp.id} className={`glass-panel ${styles.suppCard} ${taken ? styles.taken : ''}`}>
                  <div className={styles.suppLeft}>
                    <button
                      className={`${styles.checkBtn} ${taken ? styles.checkedBtn : ''}`}
                      onClick={() => toggleSupplementTaken(supp.id)}
                    >
                      {taken ? <Check size={18} /> : <span className={styles.checkCircle} />}
                    </button>
                    <div className={styles.suppIcon} style={{ background: taken ? 'rgba(0,255,213,0.15)' : `${supp.color}22`, borderColor: taken ? 'var(--beast-accent)' : supp.color }}>
                      {supp.icon}
                    </div>
                    <div className={styles.suppInfo}>
                      <h4>{supp.name}</h4>
                      <p>{supp.dose} • {TIMING_LABELS[supp.timing] || supp.timing}</p>
                      {smartTime && (
                        <p className={styles.timeTag}>
                          <Clock size={10} /> {smartTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={styles.suppRight}>
                    {supp.streak > 0 && (
                      <div className={styles.streakBadge}>
                        <Flame size={10} /> {supp.streak}
                      </div>
                    )}
                    <button className={styles.deleteBtn} onClick={() => deleteSupplement(supp.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Presets */}
      <section>
        <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => setShowPresets(!showPresets)}>
          <Plus size={16} /> ADD FROM PRESETS {showPresets ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showPresets && (
          <div className={styles.presetGrid}>
            {SUPPLEMENT_PRESETS.map(preset => {
              const already = supplements.find(s => s.name === preset.name);
              return (
                <button
                  key={preset.name}
                  className={`glass-panel ${styles.presetBtn} ${already ? styles.presetAdded : ''}`}
                  onClick={() => handleAddPreset(preset)}
                  disabled={!!already}
                >
                  <span className={styles.presetIcon}>{preset.icon}</span>
                  <div>
                    <div className={styles.presetName}>{preset.name}</div>
                    <div className={styles.presetDose}>{preset.dose}</div>
                  </div>
                  {already && <Check size={14} className={styles.addedCheck} />}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Custom Form */}
      <section>
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowCustomForm(!showCustomForm)}>
          {showCustomForm ? 'CLOSE' : '+ ADD CUSTOM SUPPLEMENT'}
        </button>
        {showCustomForm && (
          <form className={`glass-panel ${styles.customForm}`} onSubmit={handleAddCustom}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>CUSTOM SUPPLEMENT</h3>
            <input type="text" className="input-field" placeholder="SUPPLEMENT NAME (e.g. Glutamine)" value={customName} onChange={e => setCustomName(e.target.value)} required />
            <input type="text" className="input-field" placeholder="DOSE (e.g. 5g, 1 capsule)" value={customDose} onChange={e => setCustomDose(e.target.value)} required />
            <select className="input-field" value={customTiming} onChange={e => setCustomTiming(e.target.value)}>
              {Object.entries(TIMING_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ADD TO STACK</button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Supplements;
