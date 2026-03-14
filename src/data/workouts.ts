import { Workout, DayActivity } from '../types';

export const workouts: Workout[] = [
  {
    id: 'A',
    name: 'Trening A',
    focus: 'Klatka + Barki + Triceps',
    color: 'violet',
    tagClass: 'tag-A',
    exercises: [
      { name: 'Wyciskanie sztangi / hantli (ławka płaska)', sets: 4, reps: '8–10', rest: '90s', notes: 'Kontrolowany ruch, łopatki ściągnięte' },
      { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '10–12', rest: '75s' },
      { name: 'Rozpiętki z hantlami (ławka płaska)', sets: 3, reps: '12–15', rest: '60s', notes: 'Lekki łuk w łokciach, czuj rozciąganie klatki' },
      { name: 'Wyciskanie żołnierskie siedząc (hantle)', sets: 3, reps: '10–12', rest: '75s', notes: 'Siedząc = mniejsze obciążenie kręgosłupa' },
      { name: 'Boczne unoszenie hantli', sets: 3, reps: '12–15', rest: '60s' },
      { name: 'Triceps pushdown (wyciąg linką)', sets: 3, reps: '12–15', rest: '60s' },
      { name: 'Overhead triceps extension (hantel lub linka)', sets: 3, reps: '12–15', rest: '60s' },
    ],
  },
  {
    id: 'B',
    name: 'Trening B',
    focus: 'Górny grzbiet + Biceps',
    color: 'blue',
    tagClass: 'tag-B',
    exercises: [
      { name: 'Ściąganie drążka szeroko (Lat Pulldown)', sets: 4, reps: '8–10', rest: '90s', notes: 'Ściągaj łopatki, nie wyginaj mocno lędźwi' },
      { name: 'Wiosłowanie siedząc na maszynie (kabel)', sets: 3, reps: '10–12', rest: '75s', notes: 'Bezpieczne dla rwy — tułów pionowo' },
      { name: 'Face Pulls na wyciągu (linka z uchwytami)', sets: 3, reps: '15–20', rest: '60s', notes: 'Wzmacnia rotatory barku — bardzo ważne' },
      { name: 'Uginanie hantli na biceps (Bicep Curl)', sets: 3, reps: '10–12', rest: '60s' },
      { name: 'Hammer Curl', sets: 3, reps: '12', rest: '60s', notes: 'Angażuje brachialis — dodaje grubości ramienia' },
      { name: 'Uginanie ramion na modliszce (Preacher Curl)', sets: 3, reps: '12', rest: '60s' },
    ],
  },
  {
    id: 'C',
    name: 'Trening C',
    focus: 'Nogi (bezpieczne dla rwy)',
    color: 'emerald',
    tagClass: 'tag-C',
    exercises: [
      { name: 'Leg Press (zakres ruchu ~70–80%)', sets: 4, reps: '12–15', rest: '90s', notes: 'Nie spuszczaj kolan do klatki — ochrona lędźwi!  Stopy na środku platformy.' },
      { name: 'Prostowanie nóg (Leg Extension)', sets: 4, reps: '12–15', rest: '75s', notes: 'Izolacja czworogłowych — bezpieczne dla kręgosłupa' },
      { name: 'Uginanie nóg leżąc (Lying Leg Curl)', sets: 3, reps: '12–15', rest: '75s', notes: 'Delikatnie — jeśli czujesz ból rwy, ogranicz zakres' },
      { name: 'Odwodzenie bioder (Hip Abduction Machine)', sets: 3, reps: '15–20', rest: '60s', notes: 'Wzmacnia pośladkowe — odciąża siedzenie na nerwie' },
      { name: 'Wspięcia na palce na maszynie (Standing Calf Raise)', sets: 4, reps: '15–20', rest: '45s' },
      { name: 'Plank (deska)', sets: 3, reps: '45–60 sek', rest: '60s', notes: 'Napnij brzuch i pośladki, nie wyginaj bioder' },
      { name: 'Dead Bug', sets: 3, reps: '10 pow/stronę', rest: '60s', notes: 'Wolny, kontrolowany ruch — świetny na stabilizację core' },
    ],
  },
  {
    id: 'D',
    name: 'Trening D',
    focus: 'Górna część ciała + Core',
    color: 'orange',
    tagClass: 'tag-D',
    exercises: [
      { name: 'Wyciskanie hantli siedząc (Shoulder Press)', sets: 3, reps: '10–12', rest: '75s' },
      { name: 'Wyciskanie na maszynie do klatki (Chest Press)', sets: 3, reps: '12–15', rest: '75s', notes: 'Maszyna = mniejszy wymóg stabilizacji lędźwi' },
      { name: 'Przeciąganie liny / Cable Crossover', sets: 3, reps: '12–15', rest: '60s' },
      { name: 'Ściąganie drążka wąskim chwytem (Close-grip Pulldown)', sets: 3, reps: '10–12', rest: '75s' },
      { name: 'Superset: Biceps Curl + Triceps Pushdown', sets: 3, reps: '12 + 12', rest: '60s', notes: 'Bez przerwy między ćwiczeniami, 60s przerwa po serii' },
      { name: 'Plank boczny (Side Plank)', sets: 3, reps: '30–45 sek/stronę', rest: '60s' },
      { name: 'Bird-Dog (na czworaka)', sets: 3, reps: '10 pow/stronę', rest: '60s', notes: 'Jedno z najlepszych ćwiczeń przy rwie kulszowej' },
    ],
  },
];

export const workoutMap: Record<string, Workout> = {
  A: workouts[0],
  B: workouts[1],
  C: workouts[2],
  D: workouts[3],
};

// Schedule pattern: Mon=A, Tue=B, Wed=walk, Thu=C, Fri=D, Sat=walk, Sun=rest
const DOW_SCHEDULE: Record<number, DayActivity> = {
  1: 'A',    // Monday
  2: 'B',    // Tuesday
  3: 'walk', // Wednesday
  4: 'C',    // Thursday
  5: 'D',    // Friday
  6: 'walk', // Saturday
  0: 'rest', // Sunday
};

export const getActivityForDate = (date: Date): DayActivity => {
  return DOW_SCHEDULE[date.getDay()];
};

export const activityLabels: Record<DayActivity, string> = {
  A: 'Trening A',
  B: 'Trening B',
  C: 'Trening C',
  D: 'Trening D',
  walk: 'Spacer',
  rest: 'Odpoczynek',
};

export const activityColors: Record<DayActivity, string> = {
  A: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  B: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  C: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  D: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  walk: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  rest: 'bg-gray-500/10 text-gray-500 border-gray-600/30',
};

// Project dates
export const PROJECT_START = new Date(2026, 2, 16); // March 16, 2026
export const PROJECT_END   = new Date(2026, 5, 30); // June 30, 2026
export const START_WEIGHT  = 93;
export const GOAL_WEIGHT   = 85;
// Expected loss rate: 0.6 kg/week
export const WEEKLY_LOSS   = 0.6;
