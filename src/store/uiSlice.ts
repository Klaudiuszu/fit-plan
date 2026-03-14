import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NavTab } from '../types';

interface UiState {
  activeTab: NavTab;
  selectedDate: string | null; // YYYY-MM-DD
  modalOpen: boolean;
}

const initialState: UiState = {
  activeTab: 'today',
  selectedDate: null,
  modalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTab(state, action: PayloadAction<NavTab>) {
      state.activeTab = action.payload;
    },
    openDay(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
      state.modalOpen = true;
    },
    closeModal(state) {
      state.modalOpen = false;
      state.selectedDate = null;
    },
  },
});

export const { setTab, openDay, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
