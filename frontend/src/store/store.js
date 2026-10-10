import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './jobsSlice';
import sessionsReducer from './sessionsSlice';

export const store = configureStore({
  reducer: { jobs: jobsReducer, sessions: sessionsReducer },
});
