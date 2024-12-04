import { configureStore } from '@reduxjs/toolkit';
import { formSlice } from './formSlice';
import { formApi } from './formApi';

export const store = configureStore({
  reducer: {
    form: formSlice.reducer,
    [formApi.reducerPath]: formApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(formApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
