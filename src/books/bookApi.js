import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api"
});

export const bookApi = {
  async list() {
    const response = await api.get("/books");
    return Array.isArray(response.data) ? response.data : [];
  },
  async get(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  async create(book) {
    const response = await api.post("/books", book);
    return response.data;
  },
  async update(id, book) {
    const response = await api.put(`/books/${id}`, book);
    return response.data;
  }
};
