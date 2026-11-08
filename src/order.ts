import type {
  Order,
  OrderItem,
  OrderMetadata,
  OrderResult,
  OrderStatus,
  PaymentMethod,
  Product,
  ShippingInfo,
  User,
} from "./types.js";

// Phần 7.3 — Bộ đếm đơn giản, chỉ cần duy nhất trong một phiên chạy.
let orderCounter = 1000;

function nextOrderId(): number {
  orderCounter += 1;
  return orderCounter;
}

// Phần 3 — Xử lý trạng thái đơn hàng.
export function getOrderStatusMessage(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Đơn hàng đang chờ xác nhận";
    case "confirmed":
      return "Đơn hàng đã được xác nhận";
    case "shipping":
      return "Đơn hàng đang được giao";
    case "completed":
      return "Đơn hàng đã giao thành công";
    case "cancelled":
      return "Đơn hàng đã bị hủy";
    default: {
      // Kiểm tra exhaustive: nếu thêm trạng thái mới mà quên xử lý, TypeScript báo lỗi.
      const exhaustiveCheck: never = status;
      throw new Error(`Trạng thái đơn hàng không hợp lệ: ${String(exhaustiveCheck)}`);
    }
  }
}

// Phần 4.2 — Type narrowing dựa trên result.status, không dùng as.
export function handleOrderResult(result: OrderResult): void {
  if (result.status === "success") {
    console.log("Tạo đơn hàng thành công!");
    console.log(`Mã đơn hàng: ${result.data.id}`);
    console.log(`Tổng tiền: ${result.data.totalAmount}`);
    return;
  }

  console.log(`Tạo đơn hàng thất bại: ${result.message}`);
}

// Phần 6.1 — Tìm sản phẩm theo id.
export function findProductById(
  products: Product[],
  id: number,
): Product | undefined {
  return products.find((product) => product.id === id);
}

// Phần 6.2 — Lấy tên sản phẩm, xử lý trường hợp không tồn tại.
export function getProductName(product: Product | undefined): string {
  return product !== undefined ? product.name : "Sản phẩm không tồn tại";
}

// Phần 6.3 — Chuẩn hóa số điện thoại có thể thiếu.
export function formatPhone(phone: string | null | undefined): string {
  if (phone === null || phone === undefined) {
    return "Chưa cập nhật";
  }

  const trimmed = phone.trim();
  return trimmed === "" ? "Chưa cập nhật" : trimmed;
}

function isNonBlank(value: string): boolean {
  return value.trim() !== "";
}

interface ResolvedCartLine {
  product: Product;
  quantity: number;
}

// Phần 7 — Tạo đơn hàng với đầy đủ kiểm tra nghiệp vụ.
export function createOrder(
  user: User | undefined,
  products: Product[],
  cart: {
    productId: number;
    quantity: number;
  }[],
  shippingInfo: ShippingInfo,
  paymentMethod: PaymentMethod,
  metadata?: OrderMetadata,
): OrderResult {
  // 1. Kiểm tra người dùng.
  if (user === undefined) {
    return { status: "error", message: "Người dùng không tồn tại." };
  }

  // 2. Kiểm tra giỏ hàng.
  if (cart.length === 0) {
    return { status: "error", message: "Giỏ hàng không được để trống." };
  }

  // 3, 4, 5. Kiểm tra sản phẩm, số lượng mua và tồn kho.
  const resolvedLines: ResolvedCartLine[] = [];

  for (const line of cart) {
    const product = findProductById(products, line.productId);

    if (product === undefined) {
      return {
        status: "error",
        message: `Không tìm thấy sản phẩm có mã ${line.productId}.`,
      };
    }

    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      return {
        status: "error",
        message: `Số lượng mua của sản phẩm có mã ${line.productId} phải là số nguyên dương.`,
      };
    }

    if (line.quantity > product.stock) {
      return {
        status: "error",
        message: `Số lượng mua sản phẩm "${product.name}" vượt quá tồn kho (${product.stock}).`,
      };
    }

    resolvedLines.push({ product, quantity: line.quantity });
  }

  // 6. Mỗi productId chỉ được xuất hiện một lần trong giỏ hàng.
  const seenProductIds = new Set<number>();

  for (const { product } of resolvedLines) {
    if (seenProductIds.has(product.id)) {
      return {
        status: "error",
        message: `Sản phẩm có mã ${product.id} xuất hiện nhiều lần trong giỏ hàng.`,
      };
    }
    seenProductIds.add(product.id);
  }

  // 7. Kiểm tra dữ liệu sản phẩm.
  for (const { product } of resolvedLines) {
    if (!Number.isFinite(product.price) || product.price < 0) {
      return {
        status: "error",
        message: `Giá của sản phẩm có mã ${product.id} không hợp lệ.`,
      };
    }

    if (!Number.isInteger(product.stock) || product.stock < 0) {
      return {
        status: "error",
        message: `Tồn kho của sản phẩm có mã ${product.id} không hợp lệ.`,
      };
    }
  }

  // 8. Kiểm tra thông tin giao hàng sau khi loại bỏ khoảng trắng.
  const receiverName = shippingInfo.receiverName.trim();
  const receiverPhone = shippingInfo.receiverPhone.trim();
  const address = shippingInfo.address.trim();

  if (!isNonBlank(receiverName)) {
    return {
      status: "error",
      message: "Thông tin giao hàng không hợp lệ: receiverName không được để trống.",
    };
  }

  if (!isNonBlank(receiverPhone)) {
    return {
      status: "error",
      message: "Thông tin giao hàng không hợp lệ: receiverPhone không được để trống.",
    };
  }

  if (!isNonBlank(address)) {
    return {
      status: "error",
      message: "Thông tin giao hàng không hợp lệ: address không được để trống.",
    };
  }

  // 10. Tạo danh sách OrderItem, chụp lại tên và giá tại thời điểm đặt hàng.
  const items: OrderItem[] = resolvedLines.map(({ product, quantity }) => ({
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
  }));

  // 9. Tính tổng tiền từ giá của Product, không lấy giá từ dữ liệu giỏ hàng.
  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  if (!Number.isFinite(totalAmount)) {
    return { status: "error", message: "Tổng tiền đơn hàng không hợp lệ." };
  }

  // 11. Tạo đơn hàng.
  const order: Order = {
    id: nextOrderId(),
    userId: user.id,
    items,
    totalAmount,
    status: "pending",
    paymentMethod,
    createdAt: new Date(),
    receiverName,
    receiverPhone,
    address,
    // Chỉ gán metadata khi được truyền vào (tương thích exactOptionalPropertyTypes).
    ...(metadata !== undefined ? { metadata } : {}),
  };

  // 12. Trả về kết quả thành công.
  return { status: "success", data: order };
}
