import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const loadSkillSessions = createAsyncThunk('sessions/loadAll', () => api.getSkillSessions());
export const createSkillSession = createAsyncThunk('sessions/create', (session) => api.createSkillSession(session));
export const updateSkillSession = createAsyncThunk('sessions/update', ({ sessionId, studentId, updates }) => api.updateSkillSession(sessionId, studentId, updates));
export const deleteSkillSession = createAsyncThunk('sessions/delete', ({ sessionId, studentId }) => api.deleteSkillSession(sessionId, studentId));

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(loadSkillSessions.pending, (state) => { state.status = 'loading'; state.error = null; })
    .addCase(loadSkillSessions.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
    .addCase(loadSkillSessions.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
    .addCase(createSkillSession.fulfilled, (state, action) => { state.items.unshift(action.payload); })
    .addCase(updateSkillSession.fulfilled, (state, action) => { const index = state.items.findIndex((item) => item.id === action.payload.id); if (index >= 0) state.items[index] = action.payload; })
    .addCase(deleteSkillSession.fulfilled, (state, action) => { state.items = state.items.filter((item) => item.id !== action.meta.arg.sessionId); }),
});

export default sessionsSlice.reducer;
