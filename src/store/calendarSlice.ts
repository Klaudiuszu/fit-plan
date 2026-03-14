import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DayLog } from '../types';

interface CalendarState {
  logs: Record<string, DayLog>; // key: YYYY-MM-DD
}

const savedLogs = (() => {
  try {
    const raw = localStorage.getItem('fitplan_logs');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
})();

const initialState: CalendarState = {
  logs: savedLogs,
};

const defaultLog = (date: string): DayLog => ({
  date,
  breakfastDone: false,
  lunchDone: false,
  dinnerDone: false,
  snackDone: false,
  workoutDone: false,
  walkDone: false,
  extraCalories: 0,
  notes: '',
  mealOverrides: {},
  shoppingChecked: {},
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    toggleCheck(state, action: PayloadAction<{ date: string; field: keyof Pick<DayLog, 'breakfastDone' | 'lunchDone' | 'dinnerDone' | 'snackDone' | 'workoutDone' | 'walkDone'> }>) {
      const { date, field } = action.payload;
      if (!state.logs[date]) state.logs[date] = defaultLog(date);
      (state.logs[date] as any)[field] = !(state.logs[date] as any)[field];
      localStorage.setItem('fitplan_logs', JSON.stringify(state.logs));
    },
    setExtraCalories(state, action: PayloadAction<{ date: string; calories: number }>) {
      const { date, calories } = action.payload;
      if (!state.logs[date]) state.logs[date] = defaultLog(date);
      state.logs[date].extraCalories = calories;
      localStorage.setItem('fitplan_logs', JSON.stringify(state.logs));
    },
    setWeight(state, action: PayloadAction<{ date: string; weight: number | undefined }>) {
      const { date, weight } = action.payload;
      if (!state.logs[date]) state.logs[date] = defaultLog(date);
      state.logs[date].weight = weight;
      localStorage.setItem('fitplan_logs', JSON.stringify(state.logs));
    },
    setNotes(state, action: PayloadAction<{ date: string; notes: string }>) {
      const { date, notes } = action.payload;
      if (!state.logs[date]) state.logs[date] = defaultLog(date);
      state.logs[date].notes = notes;
      localStorage.setItem('fitplan_logs', JSON.stringify(state.logs));
    },
    setMealOverride(state, action: PayloadAction<{ date: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; mealId: string | undefined }>) {
      const { date, mealType, mealId } = action.payload;
      if (!state.logs[date]) state.logs[date] = defaultLog(date);
      if (mealId === undefined) {
        delete state.logs[date].mealOverrides[mealType];
      } else {
        state.logs[date].mealOverrides[mealType] = mealId;
      }
      localStorage.setItem('fitplan_logs', JSON.stringify(state.logs));
    },
    toggleShoppingItem(state, action: PayloadAction<{ date: string; key: string }>) {
      const { date, key } = action.payload;
      if (!state.logs[date]) state.logs[date] = defaultLog(date);
      if (!state.logs[date].shoppingChecked) state.logs[date].shoppingChecked = {};
      state.logs[date].shoppingChecked[key] = !state.logs[date].shoppingChecked[key];
      localStorage.setItem('fitplan_logs', JSON.stringify(state.logs));
    },
  },
});

export const { toggleCheck, setExtraCalories, setWeight, setNotes, setMealOverride, toggleShoppingItem } = calendarSlice.actions;
export default calendarSlice.reducer;
