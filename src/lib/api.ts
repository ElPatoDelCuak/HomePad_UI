import {
  Product,
  ProductCreate,
  ProductUpdate,
  InventoryItem,
  InventoryCreate,
  InventoryUpdate,
  ShoppingItem,
  ShoppingCreate,
  ShoppingUpdate,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.detail) {
        errorMessage = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Ignorar fallo de parseo JSON
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Productos
  getProducts: () => request<Product[]>("/products/"),
  getProduct: (id: number) => request<Product>(`/products/${id}`),
  createProduct: (data: ProductCreate) =>
    request<Product>("/products/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: number, data: ProductUpdate) =>
    request<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, {
      method: "DELETE",
    }),

  // Inventario / Despensa
  getInventory: () => request<InventoryItem[]>("/inventory/"),
  getInventoryByProduct: (productId: number) =>
    request<InventoryItem>(`/inventory/product/${productId}`),
  createInventoryItem: (data: InventoryCreate) =>
    request<InventoryItem>("/inventory/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateInventoryItem: (id: number, data: InventoryUpdate) =>
    request<InventoryItem>(`/inventory/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteInventoryItem: (id: number) =>
    request<void>(`/inventory/${id}`, {
      method: "DELETE",
    }),

  // Lista de la Compra
  getShoppingList: () => request<ShoppingItem[]>("/shopping/"),
  getPickedShoppingItems: () => request<ShoppingItem[]>("/shopping/picked"),
  createShoppingItem: (data: ShoppingCreate) =>
    request<ShoppingItem>("/shopping/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateShoppingItem: (id: number, data: ShoppingUpdate) =>
    request<ShoppingItem>(`/shopping/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteShoppingItem: (id: number) =>
    request<void>(`/shopping/${id}`, {
      method: "DELETE",
    }),
  deleteShoppingItems: (ids: number[]) =>
    request<void>("/shopping/", {
      method: "DELETE",
      body: JSON.stringify(ids),
    }),
};
