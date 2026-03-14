import { useState } from 'react';
import { workouts } from '../../data/workouts';
import { Workout } from '../../types';
import { ChevronDown, ChevronUp, Clock, Dumbbell, AlertCircle, Info } from 'lucide-react';

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  violet:  { border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  text: 'text-violet-300',  dot: 'bg-violet-500' },
  blue:    { border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    dot: 'bg-blue-500' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-500' },
  orange:  { border: 'border-orange-500/30',  bg: 'bg-orange-500/10',  text: 'text-orange-300',  dot: 'bg-orange-500' },
};

function WorkoutCard({ workout }: { workout: Workout }) {
  const [open, setOpen] = useState(false);
  const c = COLOR_MAP[workout.color];

  return (
    <div className={`card border ${c.border}`}>
      {/* Header */}
      <button onClick={() => setOpen(s => !s)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
            <span className={`text-lg font-black ${c.text}`}>{workout.id}</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-100">{workout.name}</p>
            <p className={`text-xs ${c.text}`}>{workout.focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-gray-500 text-xs">
            <Clock size={12} />
            <span>~40 min</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {/* Exercise list */}
      {open && (
        <div className="mt-4 space-y-2">
          {workout.exercises.map((ex, i) => (
            <div key={i} className="bg-surface-700 rounded-xl border border-surface-600 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className={`w-5 h-5 rounded-full ${c.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className={`text-[10px] font-bold ${c.text}`}>{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 leading-tight">{ex.name}</p>
                    {ex.notes && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                        <Info size={10} className="mt-0.5 shrink-0 text-gray-600" />
                        {ex.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end text-right shrink-0 ml-2">
                  <span className="text-xs font-semibold text-gray-200">{ex.sets} × {ex.reps}</span>
                  <span className="text-[11px] text-gray-500">przerwa: {ex.rest}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainingView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Plan Treningowy</h1>
        <p className="text-sm text-gray-500 mt-0.5">4× tyg. · ~40 min · bez obciążania lędźwi</p>
      </div>

      {/* Week schedule */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-200 mb-3">Harmonogram tygodniowy</p>
        <div className="grid grid-cols-7 gap-1">
          {[
            { day: 'Pon', type: 'A', color: 'violet' },
            { day: 'Wt',  type: 'B', color: 'blue' },
            { day: 'Śr',  type: '🚶', color: 'teal' },
            { day: 'Czw', type: 'C', color: 'emerald' },
            { day: 'Pt',  type: 'D', color: 'orange' },
            { day: 'Sb',  type: '🚶', color: 'teal' },
            { day: 'Nd',  type: '–',  color: 'gray' },
          ].map(({ day, type, color }) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 font-medium">{day}</span>
              <div className={`w-full py-2 rounded-lg flex items-center justify-center text-xs font-bold
                ${color === 'violet'  ? 'bg-violet-500/20 text-violet-300' : ''}
                ${color === 'blue'    ? 'bg-blue-500/20 text-blue-300' : ''}
                ${color === 'teal'    ? 'bg-teal-500/20 text-teal-300' : ''}
                ${color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' : ''}
                ${color === 'orange'  ? 'bg-orange-500/20 text-orange-300' : ''}
                ${color === 'gray'    ? 'bg-gray-500/10 text-gray-600' : ''}
              `}>
                {type}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Środa i Sobota = aktywny spacer (wał, 45–60 min)</p>
      </div>

      {/* Sciatica warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-300">Rwa kulszowa — ważne zasady</p>
          <ul className="text-xs text-amber-300/80 mt-1.5 space-y-0.5">
            <li>• Brak martwego ciągu, przysiadów ze sztangą, wiosłowania w opadzie</li>
            <li>• Leg press z ograniczonym zakresem ruchu (70–80%), stopy na środku)</li>
            <li>• Przy bólu: zmniejsz ciężar, ogranicz zakres lub pomiń ćwiczenie</li>
            <li>• Bird-Dog i Dead Bug — wskazane, wzmacniają stabilizatory</li>
            <li>• Jeśli ból się nasila — zrób przerwę i skonsultuj z fizjoterapeutą</li>
          </ul>
        </div>
      </div>

      {/* Workout cards */}
      <div>
        <p className="section-title mb-3">Treningi</p>
        <div className="space-y-4">
          {workouts.map(w => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      </div>

      {/* Progression tip */}
      <div className="card border-surface-600 space-y-2">
        <div className="flex items-center gap-2">
          <Dumbbell size={14} className="text-accent" />
          <p className="text-sm font-semibold text-gray-200">Progresja obciążeń</p>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Co 1–2 tygodnie, gdy wykonujesz górną granicę powtórzeń we wszystkich seriach łatwo,
          zwiększ ciężar o 2.5–5 kg (ćwiczenia wielostawowe) lub 1–2 kg (izolacje).
          Notuj swoje ciężary w notatce danego dnia w Kalendarzu.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { label: 'Dzień A', days: 'Poniedziałek' },
            { label: 'Dzień B', days: 'Wtorek' },
            { label: 'Dzień C', days: 'Czwartek' },
            { label: 'Dzień D', days: 'Piątek' },
          ].map(({ label, days }) => (
            <div key={label} className="bg-surface-700 rounded-lg px-3 py-2 text-xs">
              <p className="font-medium text-gray-200">{label}</p>
              <p className="text-gray-500">{days}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
