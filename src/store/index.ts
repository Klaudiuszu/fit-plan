import { configureStore } from '@reduxjs/toolkit';
import calendarReducer from './calendarSlice';
import shoppingReducer from './shoppingSlice';
import progressReducer from './progressSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    shopping: shoppingReducer,
    progress: progressReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
