export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  options: ProductOption[];
  created_at: Date;
  updated_at: Date;
}

export interface ProductOption {
  id: number;
  title: string;
  price: number;
  discount: number;
  created_at: Date;
  updated_at: Date;
  productId: number;
}

export interface SimplifiedOption {
  id: number;
  quantity: number;
} 