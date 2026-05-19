import { configureStore } from '@reduxjs/toolkit';
// slices/demoSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const demoSlice = createSlice({
  name: 'demo',
  initialState: { message: 'hello redux 👋' },
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload;
    },
  },
});

export const { setMessage } = demoSlice.actions;
export default demoSlice.reducer;

export const store = configureStore({
  reducer: {
    demo: demoSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
