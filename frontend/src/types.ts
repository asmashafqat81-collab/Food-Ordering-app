export type Role = "user" | "admin";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

export interface User { id: string; name: string; email: string; role: Role; }
export interface Restaurant { _id: string; name: string; description: string; image: string; cuisine: string; deliveryFee: number; etaMinutes: number; isOpen: boolean; }
export interface Category { _id: string; name: string; restaurant: { _id: string; name: string } | string; }
export interface Product { _id: string; name: string; description: string; price: number; image: string; restaurant: Restaurant | { _id: string; name: string }; category: Category | { _id: string; name: string }; isAvailable: boolean; isFeatured: boolean; }
export interface CartItem { product: Product; quantity: number; }
export interface Order { _id: string; restaurant: { _id: string; name: string; image?: string }; items: { name: string; price: number; quantity: number }[]; subtotal: number; deliveryFee: number; total: number; status: OrderStatus; deliveryAddress: string; createdAt: string; }