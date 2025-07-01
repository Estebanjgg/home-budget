export interface GroceryStore {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface GroceryMonth {
  id: string;
  user_id: string;
  month_name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface GroceryItem {
  id: string;
  user_id: string;
  month_id: string;
  store_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  purchased: boolean;
  notes?: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface GroceryItemFormData {
  product_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  priority: number;
}

export interface GroceryReport {
  month: GroceryMonth;
  stores: GroceryStoreWithItems[];
  totalItems: number;
  purchasedItems: number;
  pendingItems: number;
  grandTotal: number;
  averagePerStore: number;
}

export interface GroceryStoreWithItems extends GroceryStore {
  items: GroceryItem[];
  total: number;
}

export interface GroceryMonthSummary {
  month: GroceryMonth;
  stores: GroceryStoreWithItems[];
  grandTotal: number;
}

export interface GroceryItem {
  id: string;
  user_id: string;
  month_id: string;
  store_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  purchased: boolean;
  notes?: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface GroceryItemFormData {
  product_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  priority: number;
}

export interface GroceryReport {
  month: GroceryMonth;
  stores: GroceryStoreWithItems[];
  totalItems: number;
  purchasedItems: number;
  pendingItems: number;
  grandTotal: number;
  averagePerStore: number;
}

export interface GroceryStoreWithItems extends GroceryStore {
  items: GroceryItem[];
  total: number;
}

export interface GroceryMonthSummary {
  month: GroceryMonth;
  stores: GroceryStoreWithItems[];
  grandTotal: number;
}