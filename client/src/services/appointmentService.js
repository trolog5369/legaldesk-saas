import api from './api';

export const getAllAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

export const bookAppointment = async (data) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const modifyAppointment = async (id, data) => {
  const response = await api.put(`/appointments/${id}`, data);
  return response.data;
};
