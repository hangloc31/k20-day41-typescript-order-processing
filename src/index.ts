import {
  createOrder,
  findProductById,
  formatPhone,
  getOrderStatusMessage,
  getProductName,
  handleOrderResult,
} from "./order.js";
import type {
  ManagedProduct,
  OrderMetadata,
  OrderStatus,
  PaymentMethod,
  Product,
  ShippingInfo,
  User,
} from "./types.js";

// Phần 8.1 — Dữ liệu mẫu.
const users: User[] = [
  {
    id: 1,
    fullName: "Nguyen Van An",
    email: "an@example.com",
    phone: "0901234567",
  },
];

const products: Product[] = [
  {
    id: 101,
    name: "Laptop",
    price: 15000000,
    stock: 5,
    category: "computer",
  },
  {
    id: 102,
    name: "Wireless Mouse",
    price: 350000,
    stock: 10,
    category: "accessory",
  },
];

const cart = [
  { productId: 101, quantity: 1 },
  { productId: 102, quantity: 2 },
];

const shippingInfo: ShippingInfo = {
  receiverName: "Nguyen Van B",
  receiverPhone: "0912345678",
  address: "Ha Noi",
};

const paymentMethod: PaymentMethod = "COD";

const metadata: OrderMetadata = {
  note: "Giao hàng vào buổi sáng",
  couponCode: "WELCOME10",
};

// Phần 8.2 — Gọi createOrder với người dùng đầu tiên.
// users[0] có kiểu User | undefined (do noUncheckedIndexedAccess), và createOrder
// chấp nhận User | undefined nên không cần ép kiểu.
const result = createOrder(
  users[0],
  products,
  cart,
  shippingInfo,
  paymentMethod,
  metadata,
);

console.log("=== Tạo đơn hàng ===");
handleOrderResult(result);

// Phần 8.3 — Kiểm chứng các thuộc tính của đơn hàng.
if (result.status === "success") {
  const order = result.data;

  console.log("\n=== Kiểm chứng đơn hàng ===");
  console.log(`userId: ${order.userId}`);
  console.log(`Số dòng sản phẩm: ${order.items.length}`);
  console.log(`Tổng tiền: ${order.totalAmount}`);
  console.log(`Trạng thái: ${order.status}`);
  console.log(`Phương thức thanh toán: ${order.paymentMethod}`);
  console.log(`Người nhận: ${order.receiverName}`);
  console.log(`Số điện thoại: ${order.receiverPhone}`);
  console.log(`Địa chỉ: ${order.address}`);
  console.log(`Ghi chú: ${order.metadata?.note ?? "Không có"}`);
  console.log(`Mã giảm giá: ${order.metadata?.couponCode ?? "Không có"}`);
  console.log(`Thời gian tạo: ${order.createdAt.toISOString()}`);

  console.log("\nChi tiết sản phẩm:");
  for (const item of order.items) {
    console.log(
      `- ${item.productName} x${item.quantity} = ${item.unitPrice * item.quantity}`,
    );
  }
}

// Phần 3 — Minh họa thông báo của cả 5 trạng thái.
console.log("\n=== Thông báo trạng thái ===");
const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "completed",
  "cancelled",
];

for (const status of statuses) {
  console.log(`${status}: ${getOrderStatusMessage(status)}`);
}

// Phần 6 — Minh họa xử lý dữ liệu có thể thiếu.
console.log("\n=== Tra cứu sản phẩm và định dạng số điện thoại ===");
console.log(`Sản phẩm 101: ${getProductName(findProductById(products, 101))}`);
console.log(`Sản phẩm 999: ${getProductName(findProductById(products, 999))}`);
console.log(`SĐT " 0901234567 ": ${formatPhone(" 0901234567 ")}`);
console.log(`SĐT null: ${formatPhone(null)}`);
console.log(`SĐT undefined: ${formatPhone(undefined)}`);
console.log(`SĐT "   ": ${formatPhone("   ")}`);

// Phần 5 — Minh họa ManagedProduct từ intersection type.
const laptop = findProductById(products, 101);
if (laptop !== undefined) {
  const managedProduct: ManagedProduct = {
    ...laptop,
    createdBy: 1,
    updatedAt: new Date(),
  };

  console.log("\n=== ManagedProduct ===");
  console.log(
    `Sản phẩm: ${managedProduct.name}, createdBy: ${managedProduct.createdBy}, updatedAt: ${managedProduct.updatedAt.toISOString()}`,
  );
}

// Phần 7 — Minh họa các trường hợp lỗi nghiệp vụ.
console.log("\n=== Các trường hợp lỗi ===");

// Không có người dùng.
handleOrderResult(
  createOrder(undefined, products, cart, shippingInfo, paymentMethod),
);

// Giỏ hàng rỗng.
handleOrderResult(
  createOrder(users[0], products, [], shippingInfo, paymentMethod),
);

// Sản phẩm không tồn tại.
handleOrderResult(
  createOrder(
    users[0],
    products,
    [{ productId: 999, quantity: 1 }],
    shippingInfo,
    paymentMethod,
  ),
);

// Số lượng không phải số nguyên dương.
handleOrderResult(
  createOrder(
    users[0],
    products,
    [{ productId: 101, quantity: 0 }],
    shippingInfo,
    paymentMethod,
  ),
);

// Vượt tồn kho.
handleOrderResult(
  createOrder(
    users[0],
    products,
    [{ productId: 101, quantity: 6 }],
    shippingInfo,
    paymentMethod,
  ),
);

// Sản phẩm trùng trong giỏ hàng.
handleOrderResult(
  createOrder(
    users[0],
    products,
    [
      { productId: 101, quantity: 1 },
      { productId: 101, quantity: 1 },
    ],
    shippingInfo,
    paymentMethod,
  ),
);

// Dữ liệu sản phẩm không hợp lệ.
const invalidProducts: Product[] = products.map((product) =>
  product.id === 101 ? { ...product, price: Number.NaN } : product,
);
handleOrderResult(
  createOrder(
    users[0],
    invalidProducts,
    [{ productId: 101, quantity: 1 }],
    shippingInfo,
    paymentMethod,
  ),
);

// Thông tin giao hàng không hợp lệ.
handleOrderResult(
  createOrder(
    users[0],
    products,
    cart,
    { ...shippingInfo, receiverName: "   " },
    paymentMethod,
  ),
);
