import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './expenseSlice';
import invoiceReducer from './invoiceSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    expense: expenseReducer,
    invoice: invoiceReducer,
  },
});

export default store;
