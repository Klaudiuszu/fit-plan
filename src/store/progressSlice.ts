import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgressState {
  // Weight entries are read from calendar logs — this slice handles UI state only
  activeWeek: number; // week index for weekly summary (0 = first week)
}

const initialState: ProgressState = {
  activeWeek: 0,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setActiveWeek(state, action: PayloadAction<number>) {
      state.activeWeek = action.payload;
    },
  },
});

export const { setActiveWeek } = progressSlice.actions;
export default progressSlice.reducer;
