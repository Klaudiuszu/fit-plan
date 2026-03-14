import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import { PROJECT_START, PROJECT_END, START_WEIGHT, GOAL_WEIGHT, WEEKLY_LOSS } from '../../data/workouts';
import { format, addDays, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, differenceInWeeks } from 'date-fns';
import { pl } from 'date-fns/locale';
import { TrendingDown, Target, Scale, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

const today = new Date();

// Build projected weight data (every Monday)
function buildProjected() {
  const points: { date: string; projected: number }[] = [];
  let current = new Date(PROJECT_START);
  let w = START_WEIGHT;
  while (current <= PROJECT_END) {
    points.push({ date: format(current, 'dd.MM'), projected: parseFloat(w.toFixed(1)) });
    current = addWeeks(current, 1);
    w -= WEEKLY_LOSS;
    if (w < GOAL_WEIGHT) w = GOAL_WEIGHT;
  }
  return points;
}

// Merge projected with actual weight entries from logs
function buildChartData(logs: Record<string, any>) {
  const projected = buildProjected();

  // Collect actual weight measurements (Mondays or closest)
  const actual: Record<string, number> = {};
  Object.entries(logs).forEach(([dateStr, log]: [string, any]) => {
    if (log?.weight) {
      actual[dateStr] = log.weight;
    }
  });

  return projected.map(p => {
    // Find any actual measurement around this projected date
    // We scan +/- 3 days from the projected Monday
    const projDate = new Date(2026, 2, 16); // find date matching label — easier: re-index
    return p;
  });
}

// Better: iterate all weeks and find actual weights
function buildChartDataV2(logs: Record<string, any>) {
  const points: { date: string; projected: number; actual?: number; label: string }[] = [];
  let current = new Date(PROJECT_START);
  let w = START_WEIGHT;
  let weekIdx = 0;

  while (current <= addDays(PROJECT_END, 7)) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const actual = logs[dateStr]?.weight as number | undefined;

    points.push({
      date: dateStr,
      label: `T${weekIdx}`,
      projected: parseFloat(w.toFixed(1)),
      actual,
    });

    current = addWeeks(current, 1);
    weekIdx++;
    w -= WEEKLY_LOSS;
    if (w < GOAL_WEIGHT) w = GOAL_WEIGHT;
  }
  return points;
}

// Weekly summary helper
function getWeekSummary(weekStart: Date, logs: Record<string, any>) {
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
  let workouts = 0, meals = 0, walks = 0, totalMealChecks = 0;
  let weightStart: number | undefined, weightEnd: number | undefined;

  days.forEach(day => {
    const log = logs[format(day, 'yyyy-MM-dd')];
    if (!log) return;
    if (log.workoutDone) workouts++;
    if (log.walkDone) walks++;
    const mc = [log.breakfastDone, log.lunchDone, log.dinnerDone, log.snackDone].filter(Boolean).length;
    totalMealChecks += mc;
    meals++;
    if (log.weight) {
      if (!weightStart) weightStart = log.weight;
      weightEnd = log.weight;
    }
  });

  return { workouts, walks, totalMealChecks, meals, weightStart, weightEnd };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name === 'projected' ? 'Plan' : 'Rzeczywista'}: {p.value} kg</p>
      ))}
    </div>
  );
};

export default function ProgressView() {
  const logs = useSelector((s: RootState) => s.calendar.logs);
  const chartData = buildChartDataV2(logs);

  // Find last recorded weight
  const allWeights = Object.values(logs).filter((l: any) => l?.weight).map((l: any) => ({ date: l.date, weight: l.weight }));
  allWeights.sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = allWeights.length ? allWeights[allWeights.length - 1].weight : START_WEIGHT;
  const weightLost = parseFloat((START_WEIGHT - currentWeight).toFixed(1));
  const remaining = parseFloat((currentWeight - GOAL_WEIGHT).toFixed(1));
  const progress = Math.max(0, Math.min(100, Math.round((weightLost / (START_WEIGHT - GOAL_WEIGHT)) * 100)));

  // Weeks for summary
  const totalWeeks = differenceInWeeks(PROJECT_END, PROJECT_START) + 1;
  const currentWeekStart = startOfWeek(today > PROJECT_END ? PROJECT_END : today, { weekStartsOn: 1 });
  const [summaryWeekOffset, setSummaryWeekOffset] = useState(0);

  const summaryWeekStart = addWeeks(currentWeekStart, summaryWeekOffset);
  const summaryWeekEnd = endOfWeek(summaryWeekStart, { weekStartsOn: 1 });
  const weeklySummary = getWeekSummary(summaryWeekStart, logs);

  // Motivation message
  const motivationMessages = [
    { threshold: 0,  msg: "Zaczynasz podróż! Każdy wielki cel zaczyna się od pierwszego kroku. Trzymaj się planu!" },
    { threshold: 15, msg: "Dobry start! Widzisz już pierwsze efekty. Twój organizm adaptuje się do nowego rytmu." },
    { threshold: 30, msg: "Świetna robota! Prawie 1/3 celu zaliczona. Najtrudniejszy etap masz już za sobą." },
    { threshold: 50, msg: "Połowa drogi! Jesteś konsekwentny/-a — to właśnie odróżnia tych, którzy osiągają cel." },
    { threshold: 70, msg: "70% za sobą! Końcówka jest blisko. Nie odpuszczaj teraz, kiedy cel jest na wyciągnięcie ręki!" },
    { threshold: 90, msg: "Ostatnie kilometry! 85 kg jest tuż-tuż. Wzorowa determinacja!" },
    { threshold: 100, msg: "🎉 CEL OSIĄGNIĘTY! Udowodniłeś/-aś, że konsekwencja zawsze wygrywa!" },
  ];
  const motivation = [...motivationMessages].reverse().find(m => progress >= m.threshold) ?? motivationMessages[0];

  // Expected weight today
  const weeksElapsed = Math.max(0, differenceInWeeks(today, PROJECT_START));
  const expectedWeight = parseFloat((Math.max(GOAL_WEIGHT, START_WEIGHT - WEEKLY_LOSS * weeksElapsed)).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Postępy</h1>
        <p className="text-sm text-gray-500 mt-0.5">Śledź swoją drogę do 85 kg</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Scale,        label: 'Aktualna waga',    value: `${currentWeight} kg`, color: 'text-gray-100' },
          { icon: TrendingDown, label: 'Stracone',          value: weightLost > 0 ? `–${weightLost} kg` : '0 kg', color: 'text-emerald-400' },
          { icon: Target,       label: 'Do celu',           value: remaining > 0 ? `${remaining} kg` : '✓ Cel!', color: remaining > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { icon: Trophy,       label: 'Realizacja celu',   value: `${progress}%`, color: 'text-accent' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <Icon size={16} className={`${color} mx-auto mb-1.5`} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Goal progress bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-400">Start: <span className="font-medium text-gray-200">{START_WEIGHT} kg</span></span>
          <span className="font-semibold text-accent">{progress}% celu</span>
          <span className="text-gray-400">Cel: <span className="font-medium text-gray-200">{GOAL_WEIGHT} kg</span></span>
        </div>
        <div className="h-3 rounded-full bg-surface-600 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-500">
          <span>Stracono: {weightLost} kg</span>
          <span>Oczekiwana waga dziś: {expectedWeight} kg</span>
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
        <p className="text-sm font-medium text-accent mb-1">Motywacja dnia</p>
        <p className="text-sm text-gray-300 leading-relaxed">{motivation.msg}</p>
      </div>

      {/* Weight chart */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-200 mb-4">Wykres wagi (plan vs rzeczywistość)</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262d" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[83, 95]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={GOAL_WEIGHT} stroke="#34d399" strokeDasharray="4 2" label={{ value: `Cel ${GOAL_WEIGHT}`, position: 'insideLeft', fontSize: 10, fill: '#34d399' }} />
              <Line
                type="monotone"
                dataKey="projected"
                name="projected"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="actual"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#34d399' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 justify-center text-xs">
          <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-0.5 bg-accent" style={{ borderTop: '2px dashed #6366f1' }} /> Plan</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-0.5 bg-emerald-400" /> Rzeczywista</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Wpisz wagę w Kalendarzu → kliknij dowolny dzień → pole „Waga poranna"</p>
      </div>

      {/* Weekly summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-200">Podsumowanie tygodnia</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setSummaryWeekOffset(o => o - 1)} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-surface-600 rounded-lg">
              <ChevronDown size={14} />
            </button>
            <span className="text-xs text-gray-400 min-w-[90px] text-center">
              {format(summaryWeekStart, 'd MMM', { locale: pl })} – {format(summaryWeekEnd, 'd MMM', { locale: pl })}
            </span>
            <button onClick={() => setSummaryWeekOffset(o => o + 1)} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-surface-600 rounded-lg">
              <ChevronUp size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Treningi',     value: `${weeklySummary.workouts}/4`,   sublabel: 'z 4 planowanych',  good: weeklySummary.workouts >= 3 },
            { label: 'Spacery',      value: `${weeklySummary.walks}/2`,      sublabel: 'z 2 planowanych',  good: weeklySummary.walks >= 1 },
            { label: 'Posiłki',      value: `${weeklySummary.totalMealChecks}`, sublabel: 'odchaczonych',  good: weeklySummary.totalMealChecks >= 14 },
            { label: 'Waga start',   value: weeklySummary.weightStart ? `${weeklySummary.weightStart} kg` : '—', sublabel: 'początek tygodnia', good: true },
            { label: 'Waga koniec',  value: weeklySummary.weightEnd   ? `${weeklySummary.weightEnd} kg`   : '—', sublabel: 'koniec tygodnia',   good: true },
            {
              label: 'Zmiana',
              value: (weeklySummary.weightStart && weeklySummary.weightEnd)
                ? `${(weeklySummary.weightEnd - weeklySummary.weightStart).toFixed(1)} kg`
                : '—',
              sublabel: 'w tym tygodniu',
              good: (weeklySummary.weightStart && weeklySummary.weightEnd) ? weeklySummary.weightEnd <= weeklySummary.weightStart : true,
            },
          ].map(({ label, value, sublabel, good }) => (
            <div key={label} className="bg-surface-700 rounded-xl px-3 py-2.5">
              <p className={`text-lg font-bold ${good ? 'text-gray-100' : 'text-amber-400'}`}>{value}</p>
              <p className="text-xs font-medium text-gray-300 leading-tight">{label}</p>
              <p className="text-[11px] text-gray-500">{sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expected timeline */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-200 mb-3">Oczekiwany harmonogram wagi</p>
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {chartData.slice(0, 16).map((point, i) => {
            const isCurrentWeek = i === weeksElapsed;
            return (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${isCurrentWeek ? 'bg-accent/10 border border-accent/20' : 'bg-surface-700'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-8 ${isCurrentWeek ? 'text-accent font-bold' : 'text-gray-500'}`}>{point.label}</span>
                  <span className={`text-xs ${isCurrentWeek ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                    {format(addWeeks(PROJECT_START, i), 'd MMM', { locale: pl })}
                    {isCurrentWeek && ' ← teraz'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {point.actual !== undefined && (
                    <span className={`text-xs font-semibold ${point.actual <= point.projected ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {point.actual} kg ✓
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{point.projected} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
