import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, Plus, Trash2, ShieldAlert, Sparkles, Brain, Loader } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RECIPE_LIBRARY } from '../data/recipes';
import styles from './DietPlan.module.css';

// Initialize Gemini for food analysis
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Preset Indian Foods by Target Goal (Bulking, Cutting, Maintaining)
const GOAL_FOOD_RECOMMENDATIONS = {
  bulking: [
    { name: 'Paneer Paratha with Butter', calories: 450, protein: 18, carbs: 55, fats: 20 },
    { name: 'Chicken Biryani (Double Chicken)', calories: 750, protein: 48, carbs: 90, fats: 22 },
    { name: 'Oats with Peanut Butter & Banana', calories: 550, protein: 22, carbs: 75, fats: 18 },
    { name: 'Dal Makhani with Ghee & Rice', calories: 600, protein: 20, carbs: 85, fats: 16 },
    { name: 'Soya Chunks Pulao', calories: 520, protein: 35, carbs: 70, fats: 8 }
  ],
  cutting: [
    { name: 'Grilled Chicken Breast Salad', calories: 320, protein: 40, carbs: 10, fats: 6 },
    { name: 'Egg White Bhurji (6 Eggs)', calories: 210, protein: 26, carbs: 4, fats: 2 },
    { name: 'Paneer Tikka (150g, Skimmed Milk)', calories: 340, protein: 28, carbs: 8, fats: 16 },
    { name: 'Moong Dal Chilla (No Oil)', calories: 250, protein: 14, carbs: 38, fats: 2 },
    { name: 'Boiled Soya Chunks Salad', calories: 220, protein: 30, carbs: 15, fats: 1 }
  ],
  maintaining: [
    { name: 'Fish Curry & Brown Rice', calories: 510, protein: 35, carbs: 65, fats: 12 },
    { name: 'Dal Tadka, Mix Veg & 2 Roti', calories: 430, protein: 18, carbs: 62, fats: 8 },
    { name: 'Boiled Eggs (3) & Whole Wheat Toast', calories: 360, protein: 22, carbs: 30, fats: 14 },
    { name: 'Chicken Breast (150g) & Veg Rice', calories: 480, protein: 38, carbs: 55, fats: 8 },
    { name: 'Paneer Bhurji & 2 Chapati', calories: 490, protein: 24, carbs: 46, fats: 16 }
  ]
};

const DietPlan = () => {
  const { user, meals, addMeal, deleteMeal, targets } = useContext(AppContext);
  const [naturalText, setNaturalText] = useState('');
  const [activeGoalTab, setActiveGoalTab] = useState('bulking');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState('');
  const [activeRecipeTab, setActiveRecipeTab] = useState('snacks');
  
  // Custom manual states
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [showAddForm, setShowAddForm] = useState(false);

  // Consume details
  const consumedProtein = meals.reduce((sum, m) => sum + (parseFloat(m.protein) || 0), 0);
  const consumedCarbs = meals.reduce((sum, m) => sum + (parseFloat(m.carbs) || 0), 0);
  const consumedFats = meals.reduce((sum, m) => sum + (parseFloat(m.fats) || 0), 0);
  const consumedCalories = meals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0);

  const pieData = [
    { name: 'Protein', value: consumedProtein || 1, color: 'var(--beast-secondary)' },
    { name: 'Carbs', value: consumedCarbs || 1, color: 'var(--beast-accent)' },
    { name: 'Fats', value: consumedFats || 1, color: 'var(--beast-primary)' },
  ];

  const handleNaturalParse = async (e) => {
    e.preventDefault();
    if (!naturalText.trim()) return;
    setIsParsing(true);
    setParseResult(null);
    setParseError('');

    try {
      if (!genAI) throw new Error('No API key');

      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const prompt = `You are a highly accurate nutritional database for Indian and International foods.

Analyze the following food item/meal and return ONLY a valid JSON object with these exact fields. No text before or after. No markdown code blocks. Just raw JSON.

Food to analyze: "${naturalText}"

Return this structure:
{
  "name": "Exact descriptive name with quantity",
  "calories": <integer>,
  "protein": <number with 1 decimal>,
  "carbs": <number with 1 decimal>,
  "fats": <number with 1 decimal>,
  "fiber": <number with 1 decimal>,
  "sugar": <number with 1 decimal>,
  "confidence": "high" | "medium" | "low"
}

Rules:
- Be extremely accurate. Use real nutritional database values.
- If no quantity is given, assume a standard serving.
- For Indian foods, use standard home-cooked recipe values.
- The macros (protein*4 + carbs*4 + fats*9) should approximately equal calories.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      // Strip any markdown code fences if model still adds them
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(text);
      setParseResult({ ...parsed, type: mealType });
    } catch (error) {
      console.error('Food parse error:', error);
      setParseError('Could not analyze that food. Try being more specific (e.g. "200g boiled chicken breast").');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmMeal = () => {
    if (!parseResult) return;
    addMeal(parseResult);
    setParseResult(null);
    setNaturalText('');
  };

  const handleAddPreset = (preset) => {
    addMeal({ ...preset, type: mealType });
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName || !customCal) return;
    addMeal({
      name: customName,
      calories: parseFloat(customCal),
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fats: parseFloat(customFats) || 0,
      type: mealType
    });
    setCustomName('');
    setCustomCal('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFats('');
    setShowAddForm(false);
  };

  const recommendations = GOAL_FOOD_RECOMMENDATIONS[activeGoalTab];

  return (
    <div className={`page-container animate-fade-in ${styles.dietPage}`}>
      <header className={styles.header}>
        <div>
          <span className="sticker cyan">BEAST NUTRITION</span>
          <h1 className="beast-title">INDIAN DIET TRACK</h1>
        </div>
        <Target size={32} color="var(--beast-primary)" />
      </header>

      {/* Target Macros Metric Card */}
      <section className={`glass-panel ${styles.targetsCard}`}>
        <div className={styles.targetsHeader}>
          <h3>DYNAMIC NUTRITION LIMITS</h3>
          <span className="sticker">{user?.goal?.toUpperCase()} Mode</span>
        </div>
        <div className={styles.targetsGrid}>
          <div>
            <span className={styles.metricLabel}>CALORIES</span>
            <span className={styles.metricVal}>{consumedCalories} / {targets.calories} kcal</span>
          </div>
          <div>
            <span className={styles.metricLabel}>PROTEIN</span>
            <span className={styles.metricVal}>{consumedProtein} / {targets.protein}g</span>
          </div>
        </div>
      </section>

      {/* Macro shares chart */}
      <section className={styles.macrosSection}>
        <div className={`glass-panel ${styles.macroCard}`}>
          <h3>DAILY MACRO SHARES</h3>
          <div className={styles.macroContent}>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--panel-dark)', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.chartCenter}>
                <span>{consumedCalories}</span>
                <small>kcal</small>
              </div>
            </div>
            
            <div className={styles.macroList}>
              {pieData.map(macro => (
                <div key={macro.name} className={styles.macroItem}>
                  <div className={styles.macroDot} style={{ background: macro.color }}></div>
                  <div className={styles.macroText}>
                    <span className={styles.macroName}>{macro.name.toUpperCase()}</span>
                    <span className={styles.macroValue}>{macro.value}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Macros Natural Language Parser */}
      <section className={`glass-panel ${styles.naturalParserCard}`}>
        <div className={styles.parserHeader}>
          <Brain size={20} color="var(--beast-accent)" />
          <h3>AI FOOD ANALYZER</h3>
        </div>
        <form onSubmit={handleNaturalParse} className={styles.parserForm}>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Type any food with quantity — AI will calculate the exact macros!
          </p>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. 200g paneer tikka, 1 cup oats with milk..." 
            value={naturalText}
            onChange={e => setNaturalText(e.target.value)}
            required
          />
          <div className={styles.parserControls}>
            <select className="input-field" value={mealType} onChange={e => setMealType(e.target.value)} style={{ marginBottom: 0 }}>
              {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" disabled={isParsing}>
              {isParsing ? <Loader size={16} className={styles.spinnerIcon} /> : <Sparkles size={16} />}
              {isParsing ? 'ANALYZING...' : 'ANALYZE'}
            </button>
          </div>
        </form>

        {/* AI Result Preview */}
        {parseError && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,0,85,0.1)', border: '1px solid var(--beast-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--beast-secondary)' }}>
            ⚠️ {parseError}
          </div>
        )}
        {parseResult && (
          <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(0,255,213,0.05)', border: '1px solid var(--beast-accent)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{parseResult.name.toUpperCase()}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence: {parseResult.confidence}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-beast)', fontSize: '1.1rem', color: 'var(--beast-primary)' }}>{parseResult.calories} kcal</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ textAlign: 'center', padding: '0.4rem', background: 'rgba(255,0,85,0.1)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--beast-secondary)' }}>{parseResult.protein}g</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>PROTEIN</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.4rem', background: 'rgba(0,255,213,0.1)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--beast-accent)' }}>{parseResult.carbs}g</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>CARBS</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.4rem', background: 'rgba(255,69,0,0.1)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--beast-primary)' }}>{parseResult.fats}g</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>FATS</div>
              </div>
            </div>
            {(parseResult.fiber || parseResult.sugar) && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {parseResult.fiber && <span>Fiber: {parseResult.fiber}g</span>}
                {parseResult.sugar && <span>Sugar: {parseResult.sugar}g</span>}
              </div>
            )}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} onClick={handleConfirmMeal}>
              ✓ LOG THIS MEAL
            </button>
          </div>
        )}
      </section>

      {/* Goal Suggestions Tabs */}
      <section className={styles.goalSuggestions}>
        <h3>GOAL SUGGESTIONS (INDIAN)</h3>
        <div className={styles.goalTabs}>
          {['bulking', 'cutting', 'maintaining'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeGoalTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveGoalTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.suggestList}>
          {recommendations.map((food, index) => (
            <div key={index} className={`glass-panel ${styles.presetCard}`} onClick={() => handleAddPreset(food)}>
              <div className={styles.presetMeta}>
                <h4>{food.name.toUpperCase()}</h4>
                <p className="text-muted">P: {food.protein}g, C: {food.carbs}g, F: {food.fats}g</p>
              </div>
              <div className={styles.presetAction}>
                <span className={styles.calBadge}>{food.calories} KCAL</span>
                <button className={styles.quickAddBtn}>+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recipe Library Section */}
      <section className={styles.recipeLibrary} style={{ marginTop: '1.5rem' }}>
        <h3>RECIPE LIBRARY</h3>
        <div className={styles.goalTabs}>
          {Object.keys(RECIPE_LIBRARY).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeRecipeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveRecipeTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.suggestList}>
          {RECIPE_LIBRARY[activeRecipeTab].map((recipe, index) => (
            <div key={index} className={`glass-panel ${styles.presetCard}`} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                <div className={styles.presetMeta}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontSize: '0.9rem' }}>
                    {recipe.name.toUpperCase()}
                    {recipe.dietType === 'Veg' && <span title="Vegetarian">🟢</span>}
                    {recipe.dietType === 'Non-Veg' && <span title="Non-Vegetarian">🔴</span>}
                    {recipe.dietType === 'Vegan' && <span title="Vegan">🌿</span>}
                  </h4>
                  <p className="text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>P: {recipe.protein}g, C: {recipe.carbs}g, F: {recipe.fats}g | ⏱️ {recipe.prepTime}</p>
                </div>
                <div className={styles.presetAction} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className={styles.calBadge}>{recipe.calories} KCAL</span>
                  <button className={styles.quickAddBtn} onClick={() => handleAddPreset(recipe)} style={{ alignSelf: 'flex-end' }}>+</button>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', width: '100%', lineHeight: '1.4' }}>
                <strong>Cooking Guide:</strong> {recipe.cookingGuide}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Manual Entry */}
      <section>
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'CLOSE MANUAL LOG' : 'LOG FOOD MANUALLY'}
        </button>

        {showAddForm && (
          <form className={`glass-panel ${styles.customForm}`} onSubmit={handleAddCustom}>
            <h3>LOG CUSTOM FOOD</h3>
            <input 
              type="text" 
              className="input-field" 
              placeholder="MEAL NAME" 
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              required 
            />
            <div className={styles.formGrid}>
              <input 
                type="number" 
                className="input-field" 
                placeholder="KCAL" 
                value={customCal}
                onChange={e => setCustomCal(e.target.value)}
                required 
              />
              <input 
                type="number" 
                className="input-field" 
                placeholder="PROTEIN (G)" 
                value={customProtein}
                onChange={e => setCustomProtein(e.target.value)}
              />
            </div>
            <div className={styles.formGrid}>
              <input 
                type="number" 
                className="input-field" 
                placeholder="CARBS (G)" 
                value={customCarbs}
                onChange={e => setCustomCarbs(e.target.value)}
              />
              <input 
                type="number" 
                className="input-field" 
                placeholder="FATS (G)" 
                value={customFats}
                onChange={e => setCustomFats(e.target.value)}
              />
            </div>
            <select className="input-field" value={mealType} onChange={e => setMealType(e.target.value)}>
              {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ADD MEAL</button>
          </form>
        )}
      </section>

      {/* Consumed food list */}
      <section className={styles.loggedSection}>
        <h3>TODAY'S FUEL CONSUMED</h3>
        <div className={styles.mealList}>
          {meals.length === 0 ? (
            <p className={styles.emptyMsg}>NO FUEL LOGGED TODAY. PARSE WHAT YOU ATE!</p>
          ) : (
            meals.map(meal => (
              <div key={meal.id} className={`glass-panel ${styles.mealCard}`}>
                <div className={styles.mealDetails}>
                  <div className={styles.mealTimeTag}>{meal.type.toUpperCase()}</div>
                  <h4>{meal.name.toUpperCase()}</h4>
                  <p className="text-muted">P: {meal.protein}g, C: {meal.carbs}g, F: {meal.fats}g</p>
                </div>
                <div className={styles.mealAction}>
                  <span className={styles.calText}>{meal.calories} kcal</span>
                  <button className={styles.deleteBtn} onClick={() => deleteMeal(meal.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DietPlan;
