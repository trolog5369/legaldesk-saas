import api from './api';

export const getInvoicesByCase = async (caseId) => {
  const response = await api.get(`/invoices/case/${caseId}`);
  return response.data;
};

export const createInvoice = async (data) => {
  const response = await api.post('/invoices/generate', data);
  return response.data;
};

export const getDownloadLink = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}/download`);
  return response.data;
};

export const updateInvoiceStatus = async (invoiceId, status) => {
  const response = await api.patch(`/invoices/${invoiceId}/status`, { status });
  return response.data;
};
