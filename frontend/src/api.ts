import type { Category, Order, Product, Restaurant, User } from "./types";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
let token = localStorage.getItem("food_token") || "";

export function setToken(value: string | null) {
  token = value || "";
  if (token) localStorage.setItem("food_token", token);
  else localStorage.removeItem("food_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error?.message || "Request failed");
  return body.data as T;
}

export const api = {
  login: async (email: string, password: string) => {
    const data = await request<{token: string; user: User}>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setToken(data.token); return data.user;
  },
  register: async (name: string, email: string, password: string) => {
    const data = await request<{token: string; user: User}>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
    setToken(data.token); return data.user;
  },
  me: () => request<User>("/auth/me"),
  restaurants: () => request<Restaurant[]>("/restaurants"),
  categories: (restaurant?: string) => request<Category[]>(`/categories${restaurant ? `?restaurant=${restaurant}` : ""}`),
  products: (params = "") => request<Product[]>(`/products${params ? `?${params}` : ""}`),
  createProduct: (data: Partial<Product>) => request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
  orders: () => request<Order[]>("/orders/my-orders"),
  allOrders: () => request<any[]>("/orders"),
  createOrder: (data: any) => request<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: string) => request<Order>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) })
};