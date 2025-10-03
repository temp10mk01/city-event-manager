import axios from "axios";
import { getToken } from "./auth";

// pagrindinis api sasaja
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

// automatiškai pridedame token i headers
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("request klaida:", error);
    return Promise.reject(error);
  }
);

// atsakymo tarpininkas klaidu tvarkymui 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token nebegalioja - nukreipiame i login
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ========== autentifikavimas ==========
// vartotojo registracija
export async function registerUser(data) {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
  } catch (error) {
    console.error("registracijos klaida:", error);
    throw error;
  }
}

// vartotojo prisijungimas
export async function loginUser(data) {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (error) {
    console.error("prisijungimo klaida:", error);
    throw error;
  }
}

// ========== kategorijos ==========
// gauti visas kategorijas
export async function getCategories() {
  try {
    const res = await api.get("/categories");
    return res.data;
  } catch (error) {
    console.error("kategoriju gavimo klaida:", error);
    throw error;
  }
}

// sukurti nauja kategorija
export async function createCategory(name) {
  try {
    const res = await api.post("/categories", { name });
    return res.data;
  } catch (error) {
    console.error("kategorijos kurimo klaida:", error);
    throw error;
  }
}

// ========== renginiai ==========
// gauti visus renginius su filtrais
export async function getEvents(params = {}) {
  try {
    const res = await api.get("/events", { params });
    return res.data;
  } catch (error) {
    console.error("renginiu gavimo klaida:", error);
    throw error;
  }
}

// sukurti nauja rengini
export async function createEvent(eventData) {
  try {
    const { data } = await api.post("/events", eventData);
    return data;
  } catch (error) {
    console.error("renginio kurimo klaida:", error);
    throw error;
  }
}

// gauti viena rengini pagal id
export async function getEvent(id) {
  try {
    const { data } = await api.get(`/events/${id}`);
    return data;
  } catch (error) {
    console.error("renginio gavimo klaida:", error);
    throw error;
  }
}

// atnaujinti rengini
export async function updateEvent(id, eventData) {
  try {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data;
  } catch (error) {
    console.error("renginio atnaujinimo klaida:", error);
    throw error;
  }
}

// istrinti rengini
export async function deleteEvent(id) {
  try {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  } catch (error) {
    console.error("renginio šalinimo klaida:", error);
    throw error;
  }
}

// ivertinti rengini
export async function rateEvent(id, score, comment = null) {
  try {
    const res = await api.post(`/events/${id}/rate`, { score, comment });
    return res.data;
  } catch (error) {
    console.error("renginio ivertinimo klaida:", error);
    throw error;
  }
}

// ========== administravimas ==========
// patvirtinti rengini
export async function approveEvent(id) {
  try {
    const res = await api.post(`/admin/events/${id}/approve`);
    return res.data;
  } catch (error) {
    console.error("renginio patvirtinimo klaida:", error);
    throw error;
  }
}

// atmesti rengini
export async function rejectEvent(id) {
  try {
    const res = await api.post(`/admin/events/${id}/reject`);
    return res.data;
  } catch (error) {
    console.error("renginio atmetimo klaida:", error);
    throw error;
  }
}

// gauti laukiancius renginius
export async function getPendingEvents() {
  try {
    const res = await api.get("/admin/events/pending");
    return res.data;
  } catch (error) {
    console.error("laukianciu renginiu gavimo klaida:", error);
    throw error;
  }
}

// gauti visus vartotojus
export async function getUsers() {
  try {
    const res = await api.get("/admin/users");
    return res.data;
  } catch (error) {
    console.error("vartotoju gavimo klaida:", error);
    throw error;
  }
}

// keisti vartotojo vaidmeni
export async function updateUserRole(id, role) {
  try {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
  } catch (error) {
    console.error("vartotojo vaidmens keitimo klaida:", error);
    throw error;
  }
}

// gauti statistikas
export async function getAdminStats() {
  try {
    const res = await api.get("/admin/stats");
    return res.data;
  } catch (error) {
    console.error("statistiku gavimo klaida:", error);
    throw error;
  }
}

export default api;
