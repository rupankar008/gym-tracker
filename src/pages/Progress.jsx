import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Activity, Plus, Trophy, TrendingUp, Sparkles, Scale, Ruler } from 'lucide-react';
import styles from './Progress.module.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'CHEST', unit: 'cm' },
  { key: 'waist', label: 'WAIST', unit: 'cm' },
  { key: 'hips', label: 'HIPS', unit: 'cm' },
  { key: 'arms', label: 'ARMS', unit: 'cm' },
  { key: 'thighs', label: 'THIGHS', unit: 'cm' },
  { key: 'weight', label: 'WEIGHT', unit: 'kg' },
];

const Progress = () => {
  const {
    user, bodyMeasurements, addBodyMeasurement,
    personalRecords, completedWorkouts, meals
  } = useContext(AppContext);

  const [form, setForm] = useState({ chest: '', waist: '', hips: '', arms: '', thighs: '', weight: '' });
  const [showForm, setShowForm] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSave = (e) => {
    e.preventDefault();
    const entry = {};
    MEASUREMENT_FIELDS.forEach(f => { if (form[f.key]) entry[f.key] = parseFloat(form[f.key]); });
    if (Object.keys(entry).length === 0) return;
    addBodyMeasurement(entry);
    setForm({ chest: '', waist: '', hips: '', arms: '', thighs: '', weight: '' });
    setShowForm(false);
  };

  // BMI
  const weight = parseFloat(user?.weight) || 0;
  const heightM = (parseFloat(user?.height) || 0) / 100;
  const bmi = heightM > 0 ? (weight / (heightM * heightM)).toFixed(1) : '--';
  const getBMICategory = (b) => {
    if (b < 18.5) return { label: 'Underweight', color: '#00aaff' };
    if (b < 25) return { label: 'Normal', color: '#00ffd5' };
    if (b < 30) return { label: 'Overweight', color: '#ffaa00' };
    return { label: 'Obese', color: '#ff4500' };
  };
  const bmiInfo = getBMICategory(parseFloat(bmi));

  // Last vs previous measurement diff
  const latestM = bodyMeasurements[bodyMeasurements.length - 1];
  const prevM = bodyMeasurements[bodyMeasurements.length - 2];
  const getDiff = (key) => {
    if (!latestM || !prevM || !latestM[key] || !prevM[key]) return null;
    return (latestM[key] - prevM[key]).toFixed(1);
  };

  // Workout heatmap — last 28 days
  const today = new Date();
  const last28 = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });
  const getIntensity = (dateStr) => {
    const dayData = completedWorkouts[dateStr];
    if (!dayData) return 0;
    const sets = Object.values(dayData).reduce((s, ex) => s + (ex.completedSets?.length || 0), 0);
    if (sets === 0) return 0;
    if (sets <= 3) return 1;
    if (sets <= 8) return 2;
    if (sets <= 15) return 3;
    return 4;
  };

  // PR list
  const prList = Object.values(personalRecords);

  // Weekly AI Report
  const generateReport = async () => {
    if (!genAI) return;
    setAiLoading(true);
    setAiReport('');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const last7Days = last28.slice(-7);
      const workoutDays = last7Days.filter(d => completedWorkouts[d] && Object.keys(completedWorkouts[d]).length > 0).length;
      const totalSets = last7Days.reduce((total, d) => {
        const dayData = completedWorkouts[d] || {};
        return total + Object.values(dayData).reduce((s, ex) => s + (ex.completedSets?.length || 0), 0);
      }, 0);
      const avgCalories = Math.round(meals.reduce((s, m) => s + (parseFloat(m.calories) || 0), 0));
      const topPR = prList.sort((a, b) => b.estimated1RM - a.estimated1RM)[0];

      const prompt = `You are a motivating personal trainer giving a weekly performance summary. Be specific, data-driven, and encouraging. Keep it to 4-5 sentences, no markdown, plain text only.

Athlete: ${user?.name}, ${user?.age}yo, ${user?.weight}kg, Goal: ${user?.goal}
Experience: ${user?.experience || 'beginner'}, Gym ${user?.gymFrequency || 3}x/week

This week stats:
- Workout days: ${workoutDays}/7
- Total sets completed: ${totalSets}
- Today's calories logged: ${avgCalories} kcal
- Best Personal Record: ${topPR ? `${topPR.exerciseName} – ${topPR.estimated1RM}kg estimated 1RM` : 'No PRs yet'}
- BMI: ${bmi} (${bmiInfo.label})

Give a personalized weekly report and 2 specific tips for next week.`;

      const result = await model.generateContent(prompt);
      setAiReport(result.response.text());
    } catch (e) {
      setAiReport('Could not generate report. Check your API key.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`page-container animate-fade-in ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <span className="sticker">PROGRESS HQ</span>
          <h1 className="beast-title">MY PROGRESS</h1>
        </div>
        <Activity size={28} color="var(--beast-primary)" />
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['overview', 'measurements', 'records'].map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && (
        <>
          {/* BMI Card */}
          <section className={`glass-panel ${styles.bmiCard}`}>
            <div className={styles.bmiLeft}>
              <Scale size={22} color={bmiInfo.color} />
              <div>
                <span className={styles.bmiLabel}>BODY MASS INDEX</span>
                <div className={styles.bmiNum} style={{ color: bmiInfo.color }}>{bmi}</div>
                <span className={styles.bmiCategory} style={{ color: bmiInfo.color }}>{bmiInfo.label}</span>
              </div>
            </div>
            <div className={styles.bmiBar}>
              <div className={styles.bmiScale}>
                {[{r:[0,18.5],c:'#00aaff'},{r:[18.5,25],c:'#00ffd5'},{r:[25,30],c:'#ffaa00'},{r:[30,40],c:'#ff4500'}].map((s, i) => (
                  <div key={i} className={styles.bmiSegment} style={{ background: s.c, opacity: parseFloat(bmi) >= s.r[0] && parseFloat(bmi) < s.r[1] ? 1 : 0.25 }} />
                ))}
              </div>
              <div className={styles.bmiScaleLabels}>
                <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
              </div>
            </div>
          </section>

          {/* Workout Heatmap */}
          <section className={`glass-panel ${styles.heatmapCard}`}>
            <h3 className={styles.cardTitle}><TrendingUp size={16} /> WORKOUT HEATMAP (28 DAYS)</h3>
            <div className={styles.heatmapGrid}>
              {last28.map(dateStr => {
                const intensity = getIntensity(dateStr);
                return (
                  <div
                    key={dateStr}
                    className={styles.heatCell}
                    style={{
                      background: intensity === 0 ? 'rgba(255,255,255,0.05)'
                        : intensity === 1 ? 'rgba(255,69,0,0.25)'
                        : intensity === 2 ? 'rgba(255,69,0,0.5)'
                        : intensity === 3 ? 'rgba(255,69,0,0.75)'
                        : 'var(--beast-primary)',
                      boxShadow: intensity > 2 ? '0 0 6px rgba(255,69,0,0.4)' : 'none'
                    }}
                    title={`${dateStr}: ${intensity === 0 ? 'Rest day' : `${intensity * 4} sets approx`}`}
                  />
                );
              })}
            </div>
            <div className={styles.heatmapLegend}>
              <span>Less</span>
              {[0,1,2,3,4].map(i => (
                <div key={i} className={styles.legendCell} style={{
                  background: i === 0 ? 'rgba(255,255,255,0.05)' : `rgba(255,69,0,${i * 0.25})`
                }} />
              ))}
              <span>More</span>
            </div>
          </section>

          {/* AI Weekly Report */}
          <section className={`glass-panel ${styles.aiCard}`}>
            <div className={styles.cardTitleRow}>
              <h3 className={styles.cardTitle}><Sparkles size={16} color="var(--beast-accent)" /> WEEKLY AI COACH REPORT</h3>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem' }} onClick={generateReport} disabled={aiLoading}>
                {aiLoading ? 'ANALYZING...' : 'GENERATE'}
              </button>
            </div>
            {aiLoading && (
              <div className={styles.dots}>
                <div className={styles.dot} /><div className={styles.dot} style={{ animationDelay: '0.2s' }} /><div className={styles.dot} style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            {aiReport ? (
              <p className={styles.aiText}>{aiReport}</p>
            ) : (
              <p className={styles.aiPlaceholder}>Hit "GENERATE" and your AI coach will review your week — workouts, calories, PRs, and give targeted advice.</p>
            )}
          </section>
        </>
      )}

      {/* ===== MEASUREMENTS TAB ===== */}
      {activeTab === 'measurements' && (
        <>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> {showForm ? 'CLOSE' : 'LOG MEASUREMENTS'}
          </button>

          {showForm && (
            <form className={`glass-panel ${styles.measureForm}`} onSubmit={handleSave}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--beast-primary)', marginBottom: '0.5rem' }}>TODAY'S MEASUREMENTS</h3>
              <div className={styles.formGrid}>
                {MEASUREMENT_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className={styles.fieldLabel}>{f.label} ({f.unit})</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder={f.unit}
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ marginBottom: 0 }}
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>SAVE ENTRY</button>
            </form>
          )}

          {/* Latest vs previous */}
          {latestM && (
            <section className={`glass-panel ${styles.latestCard}`}>
              <h3 className={styles.cardTitle}>LATEST ENTRY — {latestM.date}</h3>
              <div className={styles.measureGrid}>
                {MEASUREMENT_FIELDS.map(f => {
                  if (!latestM[f.key]) return null;
                  const diff = getDiff(f.key);
                  return (
                    <div key={f.key} className={styles.measureCell}>
                      <span className={styles.measureLabel}>{f.label}</span>
                      <span className={styles.measureVal}>{latestM[f.key]}{f.unit}</span>
                      {diff !== null && (
                        <span className={styles.measureDiff} style={{ color: parseFloat(diff) < 0 ? 'var(--beast-accent)' : 'var(--beast-primary)' }}>
                          {parseFloat(diff) > 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* History */}
          {bodyMeasurements.length === 0 && (
            <div className={`glass-panel ${styles.empty}`}>
              <Ruler size={36} style={{ opacity: 0.2 }} />
              <p>No measurements logged yet. Add your first entry above!</p>
            </div>
          )}

          {bodyMeasurements.slice().reverse().map(entry => (
            <div key={entry.id} className={`glass-panel ${styles.historyEntry}`}>
              <span className={styles.histDate}>{entry.date}</span>
              <div className={styles.histRow}>
                {MEASUREMENT_FIELDS.map(f => entry[f.key] ? (
                  <span key={f.key} className={styles.histStat}>
                    <span className={styles.histKey}>{f.label}</span>
                    {entry[f.key]}{f.unit}
                  </span>
                ) : null)}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ===== RECORDS TAB ===== */}
      {activeTab === 'records' && (
        <>
          {prList.length === 0 ? (
            <div className={`glass-panel ${styles.empty}`}>
              <Trophy size={36} style={{ opacity: 0.2 }} />
              <p>No personal records yet. Go lift something heavy and log your weight on the exercise page!</p>
            </div>
          ) : (
            <div className={styles.prList}>
              {prList.sort((a, b) => b.estimated1RM - a.estimated1RM).map((pr, i) => (
                <div key={i} className={`glass-panel ${styles.prCard}`}>
                  <div className={styles.prRank}>#{i + 1}</div>
                  <div className={styles.prInfo}>
                    <h4>{pr.exerciseName}</h4>
                    <p>{pr.weight}kg × {pr.reps} reps • {pr.date}</p>
                  </div>
                  <div className={styles.prORM}>
                    <span className={styles.prORMNum}>{pr.estimated1RM}</span>
                    <span className={styles.prORMLabel}>KG 1RM</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Progress;
