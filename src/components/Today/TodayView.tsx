import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  toggleCheck, setExtraCalories, setWeight, setNotes,
  setMealOverride, toggleShoppingItem,
} from '../../store/calendarSlice';
import { getMealPlanForDate, allMealsByType } from '../../data/meals';
import { getActivityForDate, activityLabels, activityColors, workoutMap } from '../../data/workouts';
import { Meal } from '../../types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Check, ChevronDown, ChevronUp, RotateCcw, Clock,
  Dumbbell, Footprints, ShoppingCart, Flame, Scale,
  NotebookPen, AlertCircle,
} from 'lucide-react';

const TODAY = new Date();
const DATE_STR = format(TODAY, 'yyyy-MM-dd');
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_META = {
  breakfast: { time: '11:00', label: 'Śniadanie',  icon: '🌅', doneKey: 'breakfastDone' as const },
  lunch:     { time: '13:00', label: 'Obiad',       icon: '🍽️', doneKey: 'lunchDone'    as const },
  dinner:    { time: '18:00', label: 'Kolacja',     icon: '🌙', doneKey: 'dinnerDone'   as const },
  snack:     { time: '20:00', label: 'Przekąska',   icon: '🍎', doneKey: 'snackDone'    as const },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function useLog() {
  return useSelector((s: RootState) => s.calendar.logs[DATE_STR]);
}

function useMeal(type: typeof MEAL_TYPES[number], log: ReturnType<typeof useLog>): Meal {
  const plan = getMealPlanForDate(TODAY);
  const id = log?.mealOverrides?.[type];
  return (id ? allMealsByType[type].find((m: Meal) => m.id === id) : null) ?? plan[type];
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function Section({
  icon, title, badge, children, defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden p-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-700/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-gray-400">{icon}</span>
          <span className="font-semibold text-gray-100 text-sm">{title}</span>
          {badge}
        </div>
        {open
          ? <ChevronUp size={15} className="text-gray-500 shrink-0" />
          : <ChevronDown size={15} className="text-gray-500 shrink-0" />
        }
      </button>
      {open && <div className="border-t border-surface-700">{children}</div>}
    </div>
  );
}

// ─── MEAL CARD ────────────────────────────────────────────────────────────────
function MealRow({ type }: { type: typeof MEAL_TYPES[number] }) {
  const dispatch = useDispatch();
  const log = useLog();
  const meal = useMeal(type, log);
  const { time, label, icon, doneKey } = MEAL_META[type];
  const done = !!log?.[doneKey];
  const [showRecipe, setShowRecipe] = useState(false);
  const [showAlt, setShowAlt] = useState(false);

  return (
    <div className={`border-b border-surface-700 last:border-0 transition-colors ${done ? 'bg-emerald-500/5' : ''}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={() => dispatch(toggleCheck({ date: DATE_STR, field: doneKey }))}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            done ? 'border-emerald-400 bg-emerald-400' : 'border-gray-600 hover:border-gray-400'
          }`}
        >
          {done && <Check size={12} strokeWidth={3} className="text-surface-900" />}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-500">{icon} {time}</span>
            <span className="text-[11px] text-gray-600">·</span>
            <span className="text-[11px] font-medium text-gray-400">{label}</span>
          </div>
          <p className={`text-sm font-semibold leading-tight mt-0.5 ${done ? 'text-emerald-300' : 'text-gray-100'}`}>
            {meal.name}
          </p>
          <div className="flex gap-2 mt-0.5 text-[11px] text-gray-500">
            <span className="text-amber-400 font-semibold">{meal.calories} kcal</span>
            <span>B:{meal.protein}g</span>
            <span>W:{meal.carbs}g</span>
            <span>T:{meal.fat}g</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            title="Zmień posiłek"
            onClick={() => { setShowAlt(s => !s); setShowRecipe(false); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-600 transition-colors"
          >
            <RotateCcw size={13} />
          </button>
          <button
            title={showRecipe ? 'Zwiń przepis' : 'Pokaż przepis'}
            onClick={() => { setShowRecipe(s => !s); setShowAlt(false); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-600 transition-colors"
          >
            {showRecipe ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Alternatives */}
      {showAlt && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-2">Zamień na:</p>
          <div className="space-y-1">
            {allMealsByType[type]
              .filter((m: Meal) => m.id !== meal.id)
              .map((alt: Meal) => (
                <button
                  key={alt.id}
                  onClick={() => {
                    dispatch(setMealOverride({ date: DATE_STR, mealType: type, mealId: alt.id }));
                    setShowAlt(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 transition-colors text-left"
                >
                  <span className="text-sm text-gray-200">{alt.name}</span>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">{alt.calories} kcal</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Recipe */}
      {showRecipe && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Clock size={12} />
            <span>{meal.prepTime}</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Składniki</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {meal.ingredients.map((ing, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-300">• {ing.name}</span>
                  <span className="text-gray-500 ml-2 shrink-0">{ing.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Przygotowanie</p>
            <p className="text-xs text-gray-300 leading-relaxed">{meal.recipe}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────
export default function TodayView() {
  const dispatch = useDispatch();
  const log = useLog();

  const activity = getActivityForDate(TODAY);
  const isWorkout = ['A', 'B', 'C', 'D'].includes(activity);
  const isWalk = activity === 'walk';
  const workout = isWorkout ? workoutMap[activity] : null;
  const actDone = isWorkout ? log?.workoutDone : log?.walkDone;
  const acColors = activityColors[activity];

  // Calorie totals
  const plan = getMealPlanForDate(TODAY);
  const getMeal = (type: typeof MEAL_TYPES[number]): Meal => {
    const id = log?.mealOverrides?.[type];
    return (id ? allMealsByType[type].find((m: Meal) => m.id === id) : null) ?? plan[type];
  };
  const baseKcal = MEAL_TYPES.reduce((s, t) => s + getMeal(t).calories, 0);
  const extra = log?.extraCalories ?? 0;
  const totalKcal = baseKcal + extra;
  const TARGET = 2300;
  const kcalPct = Math.min(100, Math.round((totalKcal / TARGET) * 100));
  const over = totalKcal > TARGET;

  // Shopping: all ingredients from today's meals
  const allIngredients = MEAL_TYPES.flatMap(type =>
    getMeal(type).ingredients.map((ing, idx) => ({
      key: `${type}_${idx}`,
      label: ing.name,
      amount: ing.amount,
      meal: MEAL_META[type].label,
      mealIcon: MEAL_META[type].icon,
    }))
  );
  const shoppingDone = allIngredients.filter(i => log?.shoppingChecked?.[i.key]).length;

  // Completion rings data
  const mealsCompleted = MEAL_TYPES.filter(t => log?.[MEAL_META[t].doneKey]).length;
  const ringData = [
    { label: 'Posiłki',   value: mealsCompleted, max: 4,   color: 'text-emerald-400' },
    { label: 'Zakupy',    value: shoppingDone,   max: allIngredients.length, color: 'text-blue-400' },
    { label: 'Aktywność', value: actDone ? 1 : 0, max: 1,  color: 'text-accent' },
  ];

  const [extraInput, setExtraInput] = useState(String(extra));
  const [weightInput, setWeightInput] = useState(log?.weight ? String(log.weight) : '');
  const [notesInput, setNotesInput] = useState(log?.notes ?? '');
  const [showExercises, setShowExercises] = useState(false);

  return (
    <div className="space-y-4">
      {/* ── HERO HEADER ── */}
      <div className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 capitalize">{format(TODAY, 'EEEE', { locale: pl })}</p>
            <h1 className="text-xl font-bold text-gray-100 leading-tight">
              {format(TODAY, 'd MMMM yyyy', { locale: pl })}
            </h1>
            <span className={`badge border mt-2 ${acColors}`}>
              {activityLabels[activity]}
            </span>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2 shrink-0">
            {ringData.map(({ label, value, max, color }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="relative w-11 h-11">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#26262d" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${max > 0 ? (value / max) * 94.2 : 0} 94.2`}
                      className={color}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${color}`}>
                    {value}/{max}
                  </span>
                </div>
                <p className="text-[9px] text-gray-600 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily kcal bar inline */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Kalorie dziś</span>
            <span className={`font-bold ${over ? 'text-rose-400' : 'text-amber-400'}`}>
              {totalKcal} <span className="text-gray-600 font-normal">/ {TARGET} kcal</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-600 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'}`}
              style={{ width: `${kcalPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── DIETA ── */}
      <Section
        icon={<span className="text-base">🍽️</span>}
        title="Dieta"
        badge={
          <span className={`badge text-[10px] ${mealsCompleted === 4 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-600 text-gray-400'}`}>
            {mealsCompleted}/4
          </span>
        }
      >
        {MEAL_TYPES.map(type => <MealRow key={type} type={type} />)}
      </Section>

      {/* ── TRENING / SPACER ── */}
      {(isWorkout || isWalk) && (
        <Section
          icon={isWorkout ? <Dumbbell size={15} /> : <Footprints size={15} />}
          title={isWorkout ? `${activityLabels[activity]} — ${workout?.focus}` : 'Spacer aktywny'}
          badge={
            actDone
              ? <span className="badge bg-accent/20 text-accent text-[10px]">✓ Zaliczony</span>
              : <span className="badge bg-surface-600 text-gray-400 text-[10px]">Do zrobienia</span>
          }
        >
          <div className="px-4 pt-3 pb-4 space-y-3">
            {/* Done button */}
            <button
              onClick={() => dispatch(toggleCheck({ date: DATE_STR, field: isWorkout ? 'workoutDone' : 'walkDone' }))}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                actDone
                  ? 'bg-accent text-white'
                  : 'bg-surface-700 text-gray-300 hover:bg-surface-600 border border-surface-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${actDone ? 'border-white/50 bg-white/20' : 'border-gray-500'}`}>
                {actDone && <Check size={11} strokeWidth={3} />}
              </div>
              {isWorkout
                ? (actDone ? 'Trening ukończony! 💪' : 'Oznacz jako ukończony')
                : (actDone ? 'Spacer zaliczony! 🚶' : 'Oznacz spacer jako zaliczony (45–60 min)')
              }
            </button>

            {/* Exercises */}
            {isWorkout && workout && (
              <div>
                <button
                  onClick={() => setShowExercises(s => !s)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors mb-2"
                >
                  {showExercises ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {showExercises ? 'Zwiń ćwiczenia' : `Pokaż ćwiczenia (${workout.exercises.length})`}
                </button>
                {showExercises && (
                  <div className="space-y-2">
                    {workout.exercises.map((ex, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 bg-surface-700 rounded-xl px-3 py-2.5">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="text-[10px] text-gray-600 font-bold mt-0.5 w-4 shrink-0">{i + 1}.</span>
                          <div>
                            <p className="text-sm text-gray-100 leading-tight">{ex.name}</p>
                            {ex.notes && (
                              <p className="text-[11px] text-gray-500 mt-0.5 flex items-start gap-1">
                                <AlertCircle size={10} className="mt-0.5 shrink-0" />
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-200">{ex.sets}×{ex.reps}</p>
                          <p className="text-[11px] text-gray-600">{ex.rest}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── ZAKUPY NA DZIŚ ── */}
      <Section
        icon={<ShoppingCart size={15} />}
        title="Zakupy na dziś"
        badge={
          <span className={`badge text-[10px] ${shoppingDone === allIngredients.length ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-600 text-gray-400'}`}>
            {shoppingDone}/{allIngredients.length}
          </span>
        }
        defaultOpen={false}
      >
        <div className="px-4 py-3">
          {/* Group by meal */}
          {MEAL_TYPES.map(type => {
            const items = getMeal(type).ingredients.map((ing, idx) => ({
              key: `${type}_${idx}`,
              label: ing.name,
              amount: ing.amount,
            }));
            const { label, icon } = MEAL_META[type];
            return (
              <div key={type} className="mb-3 last:mb-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  {icon} {label}
                </p>
                <div className="space-y-1">
                  {items.map(({ key, label: name, amount }) => {
                    const checked = !!log?.shoppingChecked?.[key];
                    return (
                      <button
                        key={key}
                        onClick={() => dispatch(toggleShoppingItem({ date: DATE_STR, key }))}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors text-left ${
                          checked
                            ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                            : 'bg-surface-700 border-surface-600 hover:border-surface-500'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'border-emerald-400 bg-emerald-400' : 'border-gray-600'}`}>
                          {checked && <Check size={9} strokeWidth={3} className="text-surface-900" />}
                        </div>
                        <span className={`flex-1 text-xs ${checked ? 'line-through text-gray-500' : 'text-gray-200'}`}>{name}</span>
                        <span className="text-[11px] text-gray-500 shrink-0">{amount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── KALORIE ── */}
      <Section icon={<Flame size={15} />} title="Kalorie" defaultOpen={false}>
        <div className="px-4 py-4 space-y-3">
          {/* Breakdown table */}
          <div className="space-y-1.5">
            {MEAL_TYPES.map(type => {
              const m = getMeal(type);
              const { label, icon } = MEAL_META[type];
              return (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-500">{icon} {label}</span>
                  <span className="text-gray-300 font-medium">{m.calories} kcal</span>
                </div>
              );
            })}
            <div className="pt-2 border-t border-surface-700 flex items-center justify-between">
              <span className="text-sm text-gray-400">Podjadanie / extra</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-20 bg-surface-700 border border-surface-600 rounded-xl px-2.5 py-1 text-sm text-right text-gray-100 focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="0"
                  value={extraInput}
                  min={0}
                  onChange={e => setExtraInput(e.target.value)}
                  onBlur={() => dispatch(setExtraCalories({ date: DATE_STR, calories: parseInt(extraInput) || 0 }))}
                />
                <span className="text-sm text-gray-500">kcal</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-surface-700 rounded-xl px-4 py-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-200">Łącznie dziś</span>
              <span className={`text-xl font-bold ${over ? 'text-rose-400' : 'text-amber-400'}`}>
                {totalKcal}
                <span className="text-sm font-normal text-gray-500 ml-1">/ {TARGET}</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-600 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'}`}
                style={{ width: `${kcalPct}%` }}
              />
            </div>
            <p className="text-xs mt-1.5 text-gray-500">
              {over
                ? `Przekroczyłeś cel o ${totalKcal - TARGET} kcal`
                : `Zostało ${TARGET - totalKcal} kcal do celu`
              }
            </p>
          </div>
        </div>
      </Section>

      {/* ── WAGA + NOTATKA ── */}
      <Section icon={<Scale size={15} />} title="Waga & Notatka" defaultOpen={false}>
        <div className="px-4 py-4 space-y-4">
          <div>
            <p className="label mb-2">Waga poranna (kg)</p>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="input flex-1"
                placeholder="np. 92.5"
                step={0.1}
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                onBlur={() => {
                  const w = parseFloat(weightInput);
                  dispatch(setWeight({ date: DATE_STR, weight: isNaN(w) ? undefined : w }));
                }}
              />
              <span className="text-sm text-gray-400">kg</span>
            </div>
            {log?.weight && (
              <p className="text-xs text-gray-500 mt-1.5">
                Cel: 85 kg · Zostało: <span className="text-amber-400 font-medium">{(log.weight - 85).toFixed(1)} kg</span>
              </p>
            )}
          </div>
          <div>
            <p className="label mb-2 flex items-center gap-1.5"><NotebookPen size={11} /> Notatka dnia</p>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Samopoczucie, ciężary na siłowni, zmiany..."
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              onBlur={() => dispatch(setNotes({ date: DATE_STR, notes: notesInput }))}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
