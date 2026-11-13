// src/lib/apiEntregas.js
const API = import.meta.env.VITE_API_URL || "https://crm.grupoautomotrizryr.com";

function getAuthHeader() {
  try {
    const token = localStorage.getItem("auth.access");
    if (!token || token === "undefined" || token === "null") return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

async function leerError(res) {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (typeof data === "string") return data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      return JSON.stringify(data);
    }
    return (await res.text()) || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

async function http(path, { method = "GET", body, headers, auth = false } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(auth ? getAuthHeader() : {}),
      ...(headers || {}),
    },
    body,
  });
  if (!res.ok) throw new Error((await leerError(res)) || `HTTP ${res.status}`);
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

// Recuperar todas las páginas. Así KPIs, tabla y gráficas no
// se calculan únicamente con los primeros registros de la API.
async function listarTodasLasEntregas() {
  let path = "/citas/api/entregas/";
  const rows = [];
  const visited = new Set();
  while (path && !visited.has(path)) {
    visited.add(path);
    const data = await http(path);
    if (Array.isArray(data)) return [...rows, ...data];
    if (Array.isArray(data?.results)) rows.push(...data.results);
    if (!data?.next) break;

    const nextUrl = new URL(data.next, API);
    const baseUrl = new URL(API);
    if (nextUrl.origin !== baseUrl.origin) {
      throw new Error("La paginación apunta a un servidor diferente al configurado.");
    }
    path = `${nextUrl.pathname}${nextUrl.search}`;
  }
  return rows;
}

export const apiEntregas = {
  list: listarTodasLasEntregas,
  get: (id) => http(`/citas/api/entregas/${id}/`, { auth: true }),
  create: (payload) => http("/citas/api/entregas/", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => http(`/citas/api/entregas/${id}/`, {
    method: "PUT", auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }),
  patch: (id, payload) => http(`/citas/api/entregas/${id}/`, {
    method: "PATCH", auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }),
  remove: (id) => http(`/citas/api/entregas/${id}/`, { method: "DELETE", auth: true }),
};
