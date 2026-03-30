import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("wmsToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const stockAPI = {
  getAll: () => axios.get(API_URL + "/stock", getAuthHeader()),
  create: (data) => axios.post(API_URL + "/stock", data, getAuthHeader()),
  update: (id, data) => axios.put(API_URL + `/stock/${id}`, data, getAuthHeader()),
  delete: (id) => axios.delete(API_URL + `/stock/${id}`, getAuthHeader()),
};

export const retailerAPI = {
  getAll: () => axios.get(API_URL + "/retailers", getAuthHeader()),
  create: (data) => axios.post(API_URL + "/retailers", data, getAuthHeader()),
  update: (id, data) => axios.put(API_URL + `/retailers/${id}`, data, getAuthHeader()),
  delete: (id) => axios.delete(API_URL + `/retailers/${id}`, getAuthHeader()),
};

export const saleAPI = {
  getAll: () => axios.get(API_URL + "/sales", getAuthHeader()),
  create: (data) => axios.post(API_URL + "/sales", data, getAuthHeader()),
  update: (id, data) => axios.put(API_URL + `/sales/${id}`, data, getAuthHeader()),
  delete: (id) => axios.delete(API_URL + `/sales/${id}`, getAuthHeader()),
  recordPayment: (id, data) => axios.put(API_URL + `/sales/${id}/payment`, data, getAuthHeader()),
};

export const profileAPI = {
  get: () => axios.get(API_URL + "/profile", getAuthHeader()),
  update: (data) => axios.put(API_URL + "/profile", data, getAuthHeader()),
};
