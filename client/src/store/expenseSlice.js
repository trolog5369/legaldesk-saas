import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getExpensesByCase, createExpense, removeExpense } from '../services/expenseService';

export const fetchExpensesByCase = createAsyncThunk(
  'expense/fetchExpensesByCase',
  async (caseId) => {
    const data = await getExpensesByCase(caseId);
    return data;
  }
);

export const logExpense = createAsyncThunk(
  'expense/logExpense',
  async (expenseData) => {
    const data = await createExpense(expenseData);
    return data;
  }
);

export const deleteExpense = createAsyncThunk(
  'expense/deleteExpense',
  async (expenseId) => {
    await removeExpense(expenseId);
    return expenseId;
  }
);

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchExpensesByCase
      .addCase(fetchExpensesByCase.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExpensesByCase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExpensesByCase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // logExpense
      .addCase(logExpense.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logExpense.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(logExpense.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // deleteExpense
      .addCase(deleteExpense.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default expenseSlice.reducer;
