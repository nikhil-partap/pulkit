import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const loadActiveJobs = createAsyncThunk('jobs/loadActive', () => api.getActiveJobs());
export const loadRecruiterJobs = createAsyncThunk('jobs/loadRecruiter', (recruiterId) => api.getRecruiterJobs(recruiterId));
export const createJob = createAsyncThunk('jobs/create', (job) => api.postJob(job));
export const changeJobStatus = createAsyncThunk('jobs/changeStatus', ({ jobId, recruiterId, status }) => api.updateJobStatus(jobId, recruiterId, status));
export const deleteJob = createAsyncThunk('jobs/delete', ({ jobId, recruiterId }) => api.deleteJob(jobId, recruiterId));

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { active: [], recruiter: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(loadActiveJobs.pending, (state) => { state.status = 'loading'; state.error = null; })
    .addCase(loadActiveJobs.fulfilled, (state, action) => { state.status = 'succeeded'; state.active = action.payload; })
    .addCase(loadActiveJobs.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
    .addCase(loadRecruiterJobs.pending, (state) => { state.status = 'loading'; state.error = null; })
    .addCase(loadRecruiterJobs.fulfilled, (state, action) => { state.status = 'succeeded'; state.recruiter = action.payload; })
    .addCase(loadRecruiterJobs.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; }),
});

export default jobsSlice.reducer;
