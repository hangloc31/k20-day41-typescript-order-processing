// Phần 1 — Thiết kế kiểu dữ liệu

export interface BaseEntity {
  id: number;
}

export interface Product extends BaseEntity {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface User extends BaseEntity {
  fullName: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingInfo {
  receiverName: string;
  receiverPhone: string;
  address: string;
}

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "E_WALLET";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "completed"
  | "cancelled";

// Phần 2.1 — Hai khai báo cùng tên. TypeScript tự động gộp (declaration merging)
// nên OrderMetadata hỗ trợ cả note và couponCode.
export interface OrderMetadata {
  note?: string;
}

export interface OrderMetadata {
  couponCode?: string;
}

// Phần 1.8 — Order kế thừa id từ BaseEntity và thông tin giao hàng từ ShippingInfo.
export interface Order extends BaseEntity, ShippingInfo {
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  metadata?: OrderMetadata;
}

// Phần 4.1 — Discriminated union cho kết quả xử lý đơn hàng.
export type OrderResult =
  | { status: "success"; data: Order }
  | { status: "error"; message: string };

// Phần 5 — Intersection type mở rộng Product.
export interface AuditInfo {
  createdBy: number;
  updatedAt: Date;
}

export type ManagedProduct = Product & AuditInfo;
