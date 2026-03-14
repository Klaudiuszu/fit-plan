import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setMealOverride } from '../../store/calendarSlice';
import { weekPlan, allMealsByType, getMealPlanForDate } from '../../data/meals';
import { Meal, DayMealPlan } from '../../types';
import { ChevronDown, ChevronUp, RotateCcw, Info, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';

const today = new Date();
// Week starts on Monday
const getWeekStart = (d: Date) => {
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(d, diff);
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Śniadanie (11:00)',
  lunch:     'Obiad (13:00)',
  dinner:    'Kolacja (18:00)',
  snack:     'Przekąska wieczorna',
};

const MEAL_TYPE_KEYS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

function MacroBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.min(100, Math.round((value / total) * 100));
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>{value}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MealCard({
  mealType,
  meal,
  alternatives,
  onSwap,
}: {
  mealType: typeof MEAL_TYPE_KEYS[number];
  meal: Meal;
  alternatives: Meal[];
  onSwap: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showAlt, setShowAlt] = useState(false);

  return (
    <div className="bg-surface-700 rounded-xl border border-surface-600 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">{MEAL_LABELS[mealType]}</p>
          <p className="text-sm font-semibold text-gray-100 truncate">{meal.name}</p>
          <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
            <span className="text-amber-400 font-medium">{meal.calories} kcal</span>
            <span>B:{meal.protein}g</span>
            <span>W:{meal.carbs}g</span>
            <span>T:{meal.fat}g</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button onClick={() => setShowAlt(s => !s)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-surface-600" title="Zmień posiłek">
            <RotateCcw size={14} />
          </button>
          <button onClick={() => setOpen(s => !s)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-surface-600" title="Przepis">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Alternatives panel */}
      {showAlt && (
        <div className="px-4 pb-3 border-t border-surface-600">
          <p className="text-xs text-gray-400 mb-2 mt-2">Zamień na:</p>
          <div className="space-y-1">
            {alternatives.filter(a => a.id !== meal.id).map(alt => (
              <button
                key={alt.id}
                onClick={() => { onSwap(alt.id); setShowAlt(false); }}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-surface-600 hover:bg-surface-500 transition-colors"
              >
                <span className="text-sm text-gray-200">{alt.name}</span>
                <span className="text-xs text-gray-400">{alt.calories} kcal</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recipe details */}
      {open && (
        <div className="px-4 pb-4 border-t border-surface-600 space-y-3">
          <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
            <Clock size={12} />
            <span>{meal.prepTime}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">Składniki:</p>
            <ul className="space-y-0.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between text-xs text-gray-300">
                  <span>• {ing.name}</span>
                  <span className="text-gray-500">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">Przygotowanie:</p>
            <p className="text-xs text-gray-300 leading-relaxed">{meal.recipe}</p>
          </div>
          <div className="space-y-1.5 pt-1">
            <MacroBar label="Białko" value={meal.protein} total={190} color="bg-blue-500" />
            <MacroBar label="Węglowodany" value={meal.carbs} total={250} color="bg-amber-500" />
            <MacroBar label="Tłuszcz" value={meal.fat} total={60} color="bg-rose-400" />
          </div>
        </div>
      )}
    </div>
  );
}

// Day plan block
function DayPlan({ date, plan, logs, dispatch }: {
  date: Date;
  plan: DayMealPlan;
  logs: Record<string, any>;
  dispatch: any;
}) {
  const [expanded, setExpanded] = useState(isTodayOrFuture(date));
  const dateStr = format(date, 'yyyy-MM-dd');
  const log = logs[dateStr];
  const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  function getMeal(type: typeof MEAL_TYPE_KEYS[number]): Meal {
    const overrideId = log?.mealOverrides?.[type];
    if (!overrideId) return plan[type];
    const found = allMealsByType[type].find((m: Meal) => m.id === overrideId);
    return found ?? plan[type];
  }

  const daily = MEAL_TYPE_KEYS.reduce((acc, t) => acc + getMeal(t).calories, 0);

  return (
    <div className={`card ${isToday ? 'ring-1 ring-accent/50' : ''}`}>
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isToday && <span className="badge bg-accent/20 text-accent">Dziś</span>}
          <span className="font-semibold text-gray-100 capitalize">{format(date, 'EEEE', { locale: pl })}</span>
          <span className="text-gray-500 text-sm">{format(date, 'd MMM', { locale: pl })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-400 font-medium">{daily} kcal</span>
          {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {MEAL_TYPE_KEYS.map(type => (
            <MealCard
              key={type}
              mealType={type}
              meal={getMeal(type)}
              alternatives={allMealsByType[type]}
              onSwap={(id) => dispatch(setMealOverride({ date: dateStr, mealType: type, mealId: id }))}
            />
          ))}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-700 border border-surface-600">
            <span className="text-sm text-gray-400">Razem bez przekąsek wieczornych</span>
            <span className="text-sm font-semibold text-amber-400">
              {MEAL_TYPE_KEYS.slice(0,3).reduce((a, t) => a + getMeal(t).calories, 0)} kcal
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function isTodayOrFuture(d: Date) {
  const t = new Date(); t.setHours(0,0,0,0);
  const dd = new Date(d); dd.setHours(0,0,0,0);
  return dd >= t;
}

export default function DietView() {
  const dispatch = useDispatch();
  const logs = useSelector((s: RootState) => s.calendar.logs);
  const weekStart = getWeekStart(today);

  // Show current week Mon-Sun
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Totals for current week
  const weeklyTarget = { kcal: 2300, protein: 190, carbs: 250, fat: 60 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Plan Diety</h1>
        <p className="text-sm text-gray-500 mt-0.5">Cel: ~2 300 kcal · 190g białka · bez ryb</p>
      </div>

      {/* Macros target card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-accent" />
          <p className="text-sm font-semibold text-gray-200">Twoje cele dzienne</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Kalorie', value: '~2 300', unit: 'kcal', color: 'text-amber-400' },
            { label: 'Białko', value: '190', unit: 'g', color: 'text-blue-400' },
            { label: 'Węglowodany', value: '250', unit: 'g', color: 'text-emerald-400' },
            { label: 'Tłuszcze', value: '60', unit: 'g', color: 'text-rose-400' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-surface-700 rounded-xl px-3 py-2.5 text-center">
              <p className={`text-lg font-bold ${color}`}>{value}<span className="text-xs ml-0.5 font-normal text-gray-500">{unit}</span></p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          BMR ~1 923 kcal · TDEE ~2 980 kcal · deficyt ~680 kcal → ok. –0.6 kg/tydzień
        </p>
      </div>

      {/* Meal schedule note */}
      <div className="flex flex-wrap gap-3">
        {[
          { time: '11:00', label: 'Śniadanie', desc: 'duże, sycące' },
          { time: '13:00', label: 'Obiad', desc: 'wysokobiałkowy' },
          { time: '18:00', label: 'Kolacja', desc: 'lekka' },
          { time: '20–22:00', label: 'Przekąska', desc: 'zaplanowana, nie losowa' },
        ].map(({ time, label, desc }) => (
          <div key={time} className="card-sm flex items-center gap-2 flex-1 min-w-[130px]">
            <span className="text-accent text-xs font-bold">{time}</span>
            <div>
              <p className="text-xs font-medium text-gray-200">{label}</p>
              <p className="text-[11px] text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly plan */}
      <div>
        <p className="section-title mb-3">Bieżący tydzień</p>
        <div className="space-y-3">
          {weekDays.map(day => (
            <DayPlan
              key={format(day, 'yyyy-MM-dd')}
              date={day}
              plan={getMealPlanForDate(day)}
              logs={logs}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>

      {/* Supplements note */}
      <div className="card border-surface-600">
        <p className="text-sm font-semibold text-gray-200 mb-2">Suplementy (twój schemat)</p>
        <div className="space-y-1.5 text-sm text-gray-400">
          <p>💪 <span className="text-gray-300">Kreatyna</span> — standardowo 3–5g dziennie, o dowolnej porze</p>
          <p>🥛 <span className="text-gray-300">Białko w proszku</span> — używane w przepisach śniadań i shake'ów</p>
          <p>🍋 <span className="text-gray-300">Cytrulina</span> — przed treningiem: 6–8g ok. 30 min przed</p>
        </div>
      </div>
    </div>
  );
}
