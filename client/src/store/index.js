import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './expenseSlice';
import invoiceReducer from './invoiceSlice';
import appointmentReducer from './appointmentSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    expense: expenseReducer,
    invoice: invoiceReducer,
    appointment: appointmentReducer,
    ui: uiReducer,
  },
});

export default store;
