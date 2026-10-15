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

export class ApiError extends Error {
  readonly status?: number;
  readonly isNetworkError: boolean;

  constructor(message: string, options: { status?: number; isNetworkError?: boolean } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

// Keep all API calls in one place so pages do not duplicate URL and error handling.
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con HomePad. Comprueba tu conexión y que la API esté disponible.",
      { isNetworkError: true },
    );
  }

  if (!res.ok) {
    let errorMessage = `La API respondió con un error (${res.status}).`;
    try {
      const data = await res.json();
      if (data.detail || data.message) {
        const detail = data.detail ?? data.message;
        errorMessage = typeof detail === "string" ? detail : JSON.stringify(detail);
      }
    } catch {
      // Keep the generic HTTP message when the response is not JSON.
    }
    throw new ApiError(errorMessage, { status: res.status });
  }

  // A 204 response has no JSON body to parse.
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
