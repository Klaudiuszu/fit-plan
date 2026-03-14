import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleCheck, setExtraCalories, setWeight, setNotes } from '../../store/calendarSlice';
import {
  PROJECT_START, PROJECT_END,
  getActivityForDate, activityLabels, activityColors,
  workoutMap,
} from '../../data/workouts';
import { getMealPlanForDate, allMealsByType } from '../../data/meals';
import { setMealOverride } from '../../store/calendarSlice';
import { Meal } from '../../types';
import {
  format, addDays, startOfWeek, isSameDay, isWithinInterval,
  addWeeks, startOfMonth,
} from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Check, Scale, X, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Utensils, Dumbbell,
  Footprints, Moon, Clock, RotateCcw, Flame, NotebookPen,
} from 'lucide-react';

const today = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

function isInRange(d: Date) {
  return isWithinInterval(d, { start: PROJECT_START, end: PROJECT_END });
}

function buildWeeks() {
  const weeks: Date[][] = [];
  let cur = startOfWeek(PROJECT_START, { weekStartsOn: 1 });
  while (cur <= PROJECT_END) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) week.push(addDays(cur, i));
    weeks.push(week);
    cur = addWeeks(cur, 1);
  }
  return weeks;
}
const ALL_WEEKS = buildWeeks();
const DOW = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

// ─────────────────────────────────────────────────────────────────────────────
// DAY PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DayPanel({
  date,
  onClose,
  onPrev,
  onNext,
}: {
  date: Date;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const dispatch = useDispatch();
  const dateStr = fmt(date);
  const log = useSelector((s: RootState) => s.calendar.logs[dateStr]);
  const activity = getActivityForDate(date);
  const mealPlan = getMealPlanForDate(date);
  const isToday = isSameDay(date, today);

  const [extraInput, setExtraInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showAlt, setShowAlt] = useState<string | null>(null);
  const [showExercises, setShowExercises] = useState(false);

  // Sync inputs when date or log changes
  useEffect(() => {
    setExtraInput(String(log?.extraCalories ?? 0));
    setWeightInput(log?.weight !== undefined ? String(log.weight) : '');
    setNotesInput(log?.notes ?? '');
    setExpandedMeal(null);
    setShowAlt(null);
    setShowExercises(false);
  }, [dateStr]); // eslint-disable-line

  function getMeal(type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal {
    const id = log?.mealOverrides?.[type];
    return (id ? allMealsByType[type].find((m: Meal) => m.id === id) : null) ?? mealPlan[type];
  }

  const meals = [
    { key: 'breakfastDone' as const, type: 'breakfast' as const, time: '11:00', label: 'Śniadanie', icon: '🌅' },
    { key: 'lunchDone'     as const, type: 'lunch'     as const, time: '13:00', label: 'Obiad',     icon: '🍽️' },
    { key: 'dinnerDone'    as const, type: 'dinner'    as const, time: '18:00', label: 'Kolacja',   icon: '🌙' },
    { key: 'snackDone'     as const, type: 'snack'     as const, time: '20:00', label: 'Przekąska', icon: '🍎' },
  ];

  const totalBase = meals.reduce((s, m) => s + getMeal(m.type).calories, 0);
  const extra = parseInt(extraInput) || 0;
  const totalKcal = totalBase + extra;
  const kcalTarget = 2300;
  const kcalPct = Math.min(100, Math.round((totalKcal / kcalTarget) * 100));
  const kcalOver = totalKcal > kcalTarget;

  const isWorkout = ['A', 'B', 'C', 'D'].includes(activity);
  const isWalk = activity === 'walk';
  const workout = isWorkout ? workoutMap[activity] : null;
  const activityDone = isWorkout ? log?.workoutDone : log?.walkDone;
  const mealsCompleted = meals.filter(m => log?.[m.key]).length;

  const acColors = activityColors[activity];

  return (
    <div className="flex flex-col h-full bg-surface-900 overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-surface-700">
        <div className="flex items-center justify-between mb-2">
          {/* Nav arrows */}
          <div className="flex items-center gap-1">
            <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-200 hover:bg-surface-700 transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={onNext} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-200 hover:bg-surface-700 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-200 hover:bg-surface-700 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-bold text-gray-100 capitalize leading-tight">
              {format(date, 'EEEE', { locale: pl })}
            </p>
            <p className="text-sm text-gray-400">{format(date, 'd MMMM yyyy', { locale: pl })}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {isToday && <span className="badge bg-accent/20 text-accent text-[10px]">Dziś</span>}
            <span className={`badge border text-[10px] ${acColors}`}>{activityLabels[activity]}</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-surface-800 rounded-xl px-2.5 py-2 text-center">
            <p className="text-xs font-bold text-emerald-400">{mealsCompleted}/4</p>
            <p className="text-[10px] text-gray-500">posiłki</p>
          </div>
          <div className="flex-1 bg-surface-800 rounded-xl px-2.5 py-2 text-center">
            <p className={`text-xs font-bold ${kcalOver ? 'text-rose-400' : 'text-amber-400'}`}>{totalKcal}</p>
            <p className="text-[10px] text-gray-500">kcal</p>
          </div>
          {log?.weight && (
            <div className="flex-1 bg-surface-800 rounded-xl px-2.5 py-2 text-center">
              <p className="text-xs font-bold text-blue-400">{log.weight} kg</p>
              <p className="text-[10px] text-gray-500">waga</p>
            </div>
          )}
          {(isWorkout || isWalk) && (
            <div className={`flex-1 rounded-xl px-2.5 py-2 text-center ${activityDone ? 'bg-accent/10' : 'bg-surface-800'}`}>
              <p className={`text-xs font-bold ${activityDone ? 'text-accent' : 'text-gray-500'}`}>{activityDone ? '✓' : '–'}</p>
              <p className="text-[10px] text-gray-500">{isWorkout ? 'trening' : 'spacer'}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

        {/* ── MEALS ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Utensils size={12} className="text-gray-500" />
            <p className="label">Posiłki</p>
          </div>
          <div className="space-y-2">
            {meals.map(({ key, type, time, label, icon }) => {
              const meal = getMeal(type);
              const done = !!log?.[key];
              const isExpanded = expandedMeal === type;
              const isAltOpen = showAlt === type;
              return (
                <div key={type} className={`rounded-xl border overflow-hidden transition-colors ${done ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-surface-600 bg-surface-800'}`}>
                  {/* Row */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    {/* Checkbox */}
                    <button
                      onClick={() => dispatch(toggleCheck({ date: dateStr, field: key }))}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${done ? 'border-emerald-400 bg-emerald-400' : 'border-gray-600 hover:border-gray-400'}`}
                    >
                      {done && <Check size={10} strokeWidth={3} className="text-surface-900" />}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 font-medium">{icon} {time}</span>
                        <span className="text-[10px] text-gray-500">·</span>
                        <span className="text-[10px] text-gray-500">{label}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-100 truncate leading-tight">{meal.name}</p>
                      <p className="text-[10px] text-gray-500 leading-tight">
                        <span className="text-amber-400 font-medium">{meal.calories} kcal</span>
                        {' · '}{meal.protein}g B · {meal.carbs}g W · {meal.fat}g T
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => setShowAlt(isAltOpen ? null : type)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-600 transition-colors"
                        title="Zamień posiłek"
                      >
                        <RotateCcw size={11} />
                      </button>
                      <button
                        onClick={() => setExpandedMeal(isExpanded ? null : type)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-surface-600 transition-colors"
                        title="Przepis"
                      >
                        {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    </div>
                  </div>

                  {/* Alternatives */}
                  {isAltOpen && (
                    <div className="px-3 pb-3 border-t border-surface-700 pt-2">
                      <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wide">Zamień na:</p>
                      <div className="space-y-1">
                        {allMealsByType[type].filter((m: Meal) => m.id !== meal.id).map((alt: Meal) => (
                          <button
                            key={alt.id}
                            onClick={() => {
                              dispatch(setMealOverride({ date: dateStr, mealType: type, mealId: alt.id }));
                              setShowAlt(null);
                            }}
                            className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 transition-colors"
                          >
                            <span className="text-xs text-gray-200">{alt.name}</span>
                            <span className="text-[10px] text-gray-400">{alt.calories} kcal</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recipe */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-surface-700 pt-2.5 space-y-2">
                      <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                        <Clock size={10} />
                        <span>{meal.prepTime}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Składniki</p>
                        <div className="grid grid-cols-1 gap-0.5">
                          {meal.ingredients.map((ing, i) => (
                            <div key={i} className="flex justify-between text-[11px]">
                              <span className="text-gray-300">• {ing.name}</span>
                              <span className="text-gray-500 ml-2">{ing.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Przygotowanie</p>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{meal.recipe}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── ACTIVITY ── */}
        {(isWorkout || isWalk) && (
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              {isWorkout ? <Dumbbell size={12} className="text-gray-500" /> : <Footprints size={12} className="text-gray-500" />}
              <p className="label">{isWorkout ? 'Trening' : 'Spacer'}</p>
            </div>

            {/* Done toggle */}
            <button
              onClick={() => dispatch(toggleCheck({ date: dateStr, field: isWorkout ? 'workoutDone' : 'walkDone' }))}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors mb-2 ${
                activityDone
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-surface-800 border-surface-600 text-gray-400 hover:border-surface-500'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${activityDone ? 'border-accent bg-accent' : 'border-gray-600'}`}>
                {activityDone && <Check size={10} strokeWidth={3} className="text-white" />}
              </div>
              <span className="text-sm font-medium">
                {isWorkout
                  ? `${activityLabels[activity]} ${activityDone ? '– ukończony! 💪' : '– do zrobienia'}`
                  : `Spacer ${activityDone ? '– zaliczony! 🚶' : '– do zrobienia (45–60 min)'}`
                }
              </span>
            </button>

            {/* Exercises (workout days) */}
            {isWorkout && workout && (
              <div className="bg-surface-800 rounded-xl border border-surface-600 overflow-hidden">
                <button
                  onClick={() => setShowExercises(s => !s)}
                  className="w-full flex items-center justify-between px-3 py-2.5"
                >
                  <span className="text-xs font-semibold text-gray-300">{workout.focus} · {workout.exercises.length} ćwiczeń · ~40 min</span>
                  {showExercises ? <ChevronUp size={13} className="text-gray-500" /> : <ChevronDown size={13} className="text-gray-500" />}
                </button>
                {showExercises && (
                  <div className="border-t border-surface-700 px-3 pb-3 pt-2 space-y-2">
                    {workout.exercises.map((ex, i) => (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-gray-600 mt-0.5 w-4 shrink-0">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-200 leading-tight">{ex.name}</p>
                            {ex.notes && <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{ex.notes}</p>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-semibold text-gray-300">{ex.sets}×{ex.reps}</p>
                          <p className="text-[10px] text-gray-600">{ex.rest}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── CALORIE TRACKER ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Flame size={12} className="text-gray-500" />
            <p className="label">Kalorie</p>
          </div>
          <div className="bg-surface-800 rounded-xl border border-surface-600 px-3 py-3 space-y-3">
            {/* Breakdown */}
            <div className="space-y-1.5">
              {meals.map(({ type, label }) => {
                const meal = getMeal(type);
                return (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-300">{meal.calories} kcal</span>
                  </div>
                );
              })}
              <div className="pt-1 border-t border-surface-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Dodatkowe (podjadanie)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className="w-16 bg-surface-700 border border-surface-600 rounded-lg px-2 py-0.5 text-xs text-gray-100 text-right focus:outline-none focus:ring-1 focus:ring-accent/50"
                      value={extraInput}
                      min={0}
                      onChange={e => setExtraInput(e.target.value)}
                      onBlur={() => dispatch(setExtraCalories({ date: dateStr, calories: parseInt(extraInput) || 0 }))}
                    />
                    <span className="text-xs text-gray-500">kcal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total + bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-200">Łącznie</span>
                <span className={`text-sm font-bold ${kcalOver ? 'text-rose-400' : 'text-amber-400'}`}>
                  {totalKcal} <span className="text-xs font-normal text-gray-500">/ {kcalTarget} kcal</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-600 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${kcalOver ? 'bg-rose-500' : 'bg-amber-500'}`}
                  style={{ width: `${kcalPct}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {kcalOver
                  ? `+${totalKcal - kcalTarget} kcal ponad plan`
                  : `${kcalTarget - totalKcal} kcal poniżej celu`
                }
              </p>
            </div>
          </div>
        </section>

        {/* ── WEIGHT ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Scale size={12} className="text-gray-500" />
            <p className="label">Waga poranna</p>
          </div>
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
                dispatch(setWeight({ date: dateStr, weight: isNaN(w) ? undefined : w }));
              }}
            />
            <span className="text-sm text-gray-400">kg</span>
          </div>
        </section>

        {/* ── NOTES ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <NotebookPen size={12} className="text-gray-500" />
            <p className="label">Notatka</p>
          </div>
          <textarea
            className="input min-h-[72px] resize-none text-sm"
            placeholder="Samopoczucie, ciężary na siłowni, uwagi..."
            value={notesInput}
            onChange={e => setNotesInput(e.target.value)}
            onBlur={() => dispatch(setNotes({ date: dateStr, notes: notesInput }))}
          />
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR GRID
// ─────────────────────────────────────────────────────────────────────────────
function CalendarGrid({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
}) {
  const logs = useSelector((s: RootState) => s.calendar.logs);

  // Group weeks by month
  const monthGroups: { label: string; weeks: Date[][] }[] = [];
  let curLabel = '';
  let curGroup: Date[][] = [];
  ALL_WEEKS.forEach(week => {
    const label = format(startOfMonth(week[0]), 'LLLL yyyy', { locale: pl });
    if (label !== curLabel) {
      if (curGroup.length) monthGroups.push({ label: curLabel, weeks: curGroup });
      curLabel = label;
      curGroup = [week];
    } else {
      curGroup.push(week);
    }
  });
  if (curGroup.length) monthGroups.push({ label: curLabel, weeks: curGroup });

  return (
    <div className="space-y-4">
      {monthGroups.map(({ label, weeks }) => (
        <div key={label} className="card py-3 px-3">
          <p className="font-semibold text-gray-200 capitalize text-sm mb-2 px-1">{label}</p>
          <div className="grid grid-cols-7 mb-0.5">
            {DOW.map(d => (
              <div key={d} className="text-center text-[9px] font-medium text-gray-600 py-1">{d}</div>
            ))}
          </div>
          <div className="space-y-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day, di) => {
                  const inRange = isInRange(day);
                  const isToday = isSameDay(day, today);
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const dateStr = fmt(day);
                  const log = logs[dateStr];
                  const activity = inRange ? getActivityForDate(day) : null;
                  const acColors = activity ? activityColors[activity] : '';
                  const textColor = acColors.split(' ')[1] ?? 'text-gray-500';
                  const actDone = inRange && (
                    activity === 'walk' ? log?.walkDone :
                    activity === 'rest' ? true :
                    log?.workoutDone
                  );
                  const mealsN = inRange
                    ? [log?.breakfastDone, log?.lunchDone, log?.dinnerDone, log?.snackDone].filter(Boolean).length
                    : 0;

                  return (
                    <button
                      key={di}
                      disabled={!inRange}
                      onClick={() => inRange && onSelectDate(day)}
                      className={`
                        relative flex flex-col items-center py-1.5 rounded-lg transition-all
                        ${!inRange ? 'opacity-15 cursor-default' : 'cursor-pointer'}
                        ${isSelected ? 'bg-accent/20 ring-1 ring-accent/60' : inRange ? 'hover:bg-surface-700' : ''}
                        ${isToday && !isSelected ? 'ring-1 ring-accent/40' : ''}
                      `}
                    >
                      <span className={`text-[11px] font-semibold leading-tight ${
                        isSelected ? 'text-accent' :
                        isToday ? 'text-accent/80' :
                        inRange ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {format(day, 'd')}
                      </span>

                      {inRange && activity && (
                        <span className={`text-[8px] font-bold leading-none mt-0.5 ${textColor}`}>
                          {activity === 'walk' ? 'SPC' : activity === 'rest' ? '–' : activity}
                        </span>
                      )}

                      {/* Meal dots */}
                      {inRange && mealsN > 0 && (
                        <div className="flex gap-[2px] mt-0.5">
                          {Array.from({ length: mealsN }).map((_, i) => (
                            <div key={i} className="w-[3px] h-[3px] rounded-full bg-emerald-500" />
                          ))}
                        </div>
                      )}

                      {/* Activity done dot */}
                      {inRange && actDone && activity !== 'rest' && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VIEW
// ─────────────────────────────────────────────────────────────────────────────
// Collect all in-range dates for prev/next navigation
const RANGE_DATES = (() => {
  const dates: Date[] = [];
  let d = new Date(PROJECT_START);
  while (d <= PROJECT_END) {
    dates.push(new Date(d));
    d = addDays(d, 1);
  }
  return dates;
})();

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  function navigate(dir: -1 | 1) {
    setSelectedDate(prev => {
      if (!prev) return prev;
      const idx = RANGE_DATES.findIndex(d => isSameDay(d, prev));
      const next = RANGE_DATES[idx + dir];
      return next ?? prev;
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Kalendarz</h1>
          <p className="text-xs text-gray-500 mt-0.5">16 marca – 30 czerwca 2026 · kliknij dzień</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-1.5">
        {([
          ['tag-A', 'A – Push'],
          ['tag-B', 'B – Pull'],
          ['tag-C', 'C – Nogi'],
          ['tag-D', 'D – Full'],
          ['tag-walk', 'Spacer'],
          ['tag-rest', 'Rest'],
        ] as const).map(([cls, label]) => (
          <span key={cls} className={`badge border border-current/20 ${cls} text-[10px]`}>{label}</span>
        ))}
      </div>

      {/* Two-column layout on md+, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Calendar column */}
        <div className="w-full md:flex-1 min-w-0">
          <CalendarGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        {/* Day panel — sticky on desktop, bottom drawer on mobile */}
        {selectedDate && (
          <>
            {/* Desktop: sticky sidebar panel */}
            <div className="hidden md:flex flex-col w-[340px] lg:w-[360px] shrink-0 sticky top-4 max-h-[calc(100vh-6rem)] bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden shadow-2xl">
              <DayPanel
                date={selectedDate}
                onClose={() => setSelectedDate(null)}
                onPrev={() => navigate(-1)}
                onNext={() => navigate(1)}
              />
            </div>

            {/* Mobile: bottom drawer */}
            <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedDate(null)}
              />
              {/* Drawer */}
              <div
                className="relative bg-surface-900 border-t border-surface-700 rounded-t-2xl"
                style={{ maxHeight: '88vh' }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-2 pb-1 shrink-0">
                  <div className="w-8 h-1 rounded-full bg-surface-600" />
                </div>
                <div style={{ maxHeight: 'calc(88vh - 20px)', display: 'flex', flexDirection: 'column' }}>
                  <DayPanel
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onPrev={() => navigate(-1)}
                    onNext={() => navigate(1)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
