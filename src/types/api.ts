export interface Product {
  id: number;
  name: string;
  category?: string | null;
  unit: string;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  category?: string | null;
  unit?: string;
}

export interface ProductUpdate {
  name?: string;
  category?: string | null;
  unit?: string;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  quantity: number;
  expiration_date?: string | null;
  updated_at: string;
  product?: Product | null;
}

export interface InventoryCreate {
  product_id: number;
  quantity: number;
  expiration_date?: string | null;
}

export interface InventoryUpdate {
  quantity?: number;
  expiration_date?: string | null;
}

export interface ShoppingItem {
  id: number;
  product_id: number;
  quantity: number;
  is_picked: boolean;
  created_at: string;
  product?: Product | null;
}

export interface ShoppingCreate {
  product_id: number;
  quantity: number;
  is_picked?: boolean;
}

export interface ShoppingUpdate {
  quantity?: number;
  is_picked?: boolean;
}
