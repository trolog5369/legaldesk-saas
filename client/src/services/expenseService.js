import api from './api';

export const getExpensesByCase = async (caseId) => {
  const response = await api.get(`/expenses/case/${caseId}`);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const removeExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};
