import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ArrowRight, User, Hash, Ruler, Scale, Flame, Clock, Key } from 'lucide-react';
import BodybuilderLogo from '../components/BodybuilderLogo';
import { registerUser, loginUser } from '../utils/storage';
import styles from './Auth.module.css';

const Auth = () => {
  const { login } = useContext(AppContext);
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [goal, setGoal] = useState('bulking');
  const [diet, setDiet] = useState('non-veg');
  const [gymTime, setGymTime] = useState('06:00 PM');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isRegister) {
        if (!name || !username || !password || !age || !height || !weight) {
          setErrorMsg("FILL IN ALL FIELDS, WARRIOR!");
          return;
        }
        const profile = await registerUser(name, username, password, gymTime, age, height, weight, gender, goal, diet);
        const data = {
          completedWorkouts: {},
          streak: 0,
          lastLogin: new Date().toISOString(),
          history: {},
          ...profile,
          age, height, weight, gender, goal, diet
        };
        // Simple context integration for now
        login({ ...profile, age, height, weight, gender, goal, diet, username }, data);
      } else {
        if (!username || !password) {
          setErrorMsg("ENTER USERNAME AND PASSWORD!");
          return;
        }
        const result = await loginUser(username, password);
        login({ ...result.profile, username }, result.data);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className={`page-container ${styles.authPage}`}>
      <div className={styles.brand}>
        <div className={styles.logoWrapper}>
          <BodybuilderLogo size={75} />
        </div>
        <h1 className="beast-title">TITANFIT</h1>
        <p className={styles.tagline}>TRACKING. STRENGTH. PROGRESS.</p>
      </div>

      <div className={`glass-panel ${styles.formCard}`}>
        <div className={styles.tabs}>
          <button 
            type="button"
            className={`${styles.tab} ${isRegister ? styles.activeTab : ''}`}
            onClick={() => setIsRegister(true)}
          >
            BEAST REGISTER
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${!isRegister ? styles.activeTab : ''}`}
            onClick={() => setIsRegister(false)}
          >
            QUICK LOGIN
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && <div style={{ color: 'var(--accent)', marginBottom: '1rem', fontWeight: 'bold' }}>{errorMsg}</div>}
          {isRegister ? (
            <>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="WARRIOR NAME (Display Name)" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputWrapper}>
                <Hash className={styles.inputIcon} size={20} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="UNIQUE USERNAME" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputWrapper}>
                <Key className={styles.inputIcon} size={20} />
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="SECURE PASSWORD" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles.grid}>
                <div className={styles.inputWrapper}>
                  <Hash className={styles.inputIcon} size={20} />
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="AGE" 
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputWrapper}>
                  <Ruler className={styles.inputIcon} size={20} />
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="HEIGHT (CM)" 
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <Scale className={styles.inputIcon} size={20} />
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="CURRENT WEIGHT (KG)" 
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  required
                />
              </div>

              <div className={styles.selectGroup}>
                <label>PREFERRED GYM TIME</label>
                <div className={styles.inputWrapper} style={{ marginBottom: 0 }}>
                  <Clock className={styles.inputIcon} size={20} />
                  <input 
                    type="time" 
                    className="input-field" 
                    value={gymTime} 
                    onChange={e => setGymTime(e.target.value)}
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
              </div>

              <div className={styles.selectGroup}>
                <label>GENDER</label>
                <div className={styles.radioGroup}>
                  {['male', 'female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`${styles.selectBtn} ${gender === g ? styles.selected : ''}`}
                      onClick={() => setGender(g)}
                    >
                      {g.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.selectGroup}>
                <label>YOUR MISSION / GOAL</label>
                <div className={styles.radioGroup}>
                  {['bulking', 'cutting', 'maintaining'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`${styles.selectBtn} ${goal === g ? styles.selected : ''}`}
                      onClick={() => setGoal(g)}
                    >
                      {g.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.selectGroup}>
                <label>DIET PREFERENCE</label>
                <div className={styles.radioGroup}>
                  {['veg', 'non-veg', 'vegan'].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`${styles.selectBtn} ${diet === d ? styles.selected : ''}`}
                      onClick={() => setDiet(d)}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="USERNAME" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className={styles.inputWrapper}>
                <Key className={styles.inputIcon} size={20} />
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="PASSWORD" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            {isRegister ? 'ENTER BEAST MODE' : 'LOG IN'} <ArrowRight size={20} />
          </button>
        </form>
      </div>

      <div className={styles.motivate}>
        <Flame className={styles.flame} size={18} />
        <span>"NO PAIN, NO GAIN. SHUT UP AND SQUAT!"</span>
      </div>
    </div>
  );
};

export default Auth;
