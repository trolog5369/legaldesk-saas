import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getInvoicesByCase, createInvoice, getDownloadLink } from '../services/invoiceService';

export const fetchInvoicesByCase = createAsyncThunk(
  'invoice/fetchInvoicesByCase',
  async (caseId) => {
    const data = await getInvoicesByCase(caseId);
    return data;
  }
);

export const generateInvoice = createAsyncThunk(
  'invoice/generateInvoice',
  async (payload) => {
    const data = await createInvoice(payload);
    return data;
  }
);

export const getInvoiceDownloadLink = createAsyncThunk(
  'invoice/getInvoiceDownloadLink',
  async (invoiceId) => {
    const data = await getDownloadLink(invoiceId);
    return data.signedUrl;
  }
);

const initialState = {
  items: [],
  status: 'idle',
  generateStatus: 'idle',
  error: null,
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchInvoicesByCase
      .addCase(fetchInvoicesByCase.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInvoicesByCase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchInvoicesByCase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // generateInvoice
      .addCase(generateInvoice.pending, (state) => {
        state.generateStatus = 'loading';
        state.error = null;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.generateStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.generateStatus = 'failed';
        state.error = action.error.message;
      });
      // getInvoiceDownloadLink does not affect state.items, it just resolves
  },
});

export default invoiceSlice.reducer;
