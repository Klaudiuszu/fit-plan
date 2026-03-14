import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingItem } from '../types';
import { weeklyShoppingList } from '../data/meals';

interface ShoppingState {
  items: ShoppingItem[];
}

const savedItems = (() => {
  try {
    const raw = localStorage.getItem('fitplan_shopping');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState: ShoppingState = {
  items: savedItems ?? weeklyShoppingList,
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    toggleBought(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.bought = !item.bought;
        localStorage.setItem('fitplan_shopping', JSON.stringify(state.items));
      }
    },
    resetShopping(state) {
      state.items = weeklyShoppingList.map(i => ({ ...i, bought: false }));
      localStorage.setItem('fitplan_shopping', JSON.stringify(state.items));
    },
    addCustomItem(state, action: PayloadAction<{ name: string; amount: string; category: string }>) {
      const newItem: ShoppingItem = {
        id: `custom_${Date.now()}`,
        ...action.payload,
        bought: false,
      };
      state.items.push(newItem);
      localStorage.setItem('fitplan_shopping', JSON.stringify(state.items));
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
      localStorage.setItem('fitplan_shopping', JSON.stringify(state.items));
    },
  },
});

export const { toggleBought, resetShopping, addCustomItem, removeItem } = shoppingSlice.actions;
export default shoppingSlice.reducer;
