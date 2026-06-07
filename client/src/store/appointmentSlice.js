import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllAppointments, bookAppointment, modifyAppointment } from '../services/appointmentService';

export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async () => {
    const data = await getAllAppointments();
    return data;
  }
);

export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const data = await bookAppointment(appointmentData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create appointment';
      return rejectWithValue(message);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointment/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      await modifyAppointment(appointmentId, { status: 'cancelled' });
      return appointmentId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel appointment';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle',
  createStatus: 'idle',
  error: null,
  createError: null,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAppointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // createAppointment
      .addCase(createAppointment.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload;
      })
      // cancelAppointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const appointmentId = action.payload;
        const existingAppointment = state.items.find(item => item._id === appointmentId);
        if (existingAppointment) {
          existingAppointment.status = 'cancelled';
        }
      });
  },
});

export default appointmentSlice.reducer;
