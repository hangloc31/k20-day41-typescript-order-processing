# k20-day41-typescript-order-processing

Module xử lý đơn hàng viết bằng TypeScript, chạy trên Node.js. Bài tập Day 41 gồm thiết kế kiểu dữ liệu, metadata, xử lý trạng thái, discriminated union, intersection type và các quy tắc nghiệp vụ khi tạo đơn hàng.

## Yêu cầu

- Node.js >= 20
- npm

## Cài đặt

```bash
git clone https://github.com/hangloc31/k20-day41-typescript-order-processing.git
cd k20-day41-typescript-order-processing
npm install
```

## Chạy chương trình

Build TypeScript:

```bash
npm run build
```

Chạy chương trình demo:

```bash
npm start
```

Kiểm tra kiểu mà không build:

```bash
npm run typecheck
```

## Kết quả mong đợi

Phần tạo đơn hàng in ra:

```text
=== Tạo đơn hàng ===
Tạo đơn hàng thành công!
Mã đơn hàng: 1001
Tổng tiền: 15700000
```

Các thuộc tính của đơn hàng được kiểm chứng tiếp theo:

```text
userId: 1
Số dòng sản phẩm: 2
Tổng tiền: 15700000
Trạng thái: pending
Phương thức thanh toán: COD
Người nhận: Nguyen Van B
Ghi chú: Giao hàng vào buổi sáng
Mã giảm giá: WELCOME10
```

Tổng tiền được tính từ giá sản phẩm:

- Laptop: 15000000 × 1 = 15000000
- Wireless Mouse: 350000 × 2 = 700000
- Tổng cộng: 15700000

Chương trình cũng in thông báo của cả 5 trạng thái, kết quả các hàm xử lý dữ liệu có thể thiếu, và một số trường hợp lỗi nghiệp vụ.

## Cấu trúc

```text
src/
├── types.ts   # BaseEntity, Product, User, OrderItem, ShippingInfo,
│              # PaymentMethod, OrderStatus, OrderMetadata, Order,
│              # OrderResult, AuditInfo, ManagedProduct
├── order.ts   # getOrderStatusMessage, handleOrderResult, findProductById,
│              # getProductName, formatPhone, createOrder
└── index.ts   # Dữ liệu mẫu và chạy demo
```

## Ghi chú

- `tsconfig.json` bật `strict: true`, kèm `noUncheckedIndexedAccess` và `exactOptionalPropertyTypes`.
- `OrderMetadata` được khai báo hai lần cùng tên trong `src/types.ts`; TypeScript tự động gộp (declaration merging) để hỗ trợ cả `note` và `couponCode`.
- `createOrder` kiểm tra lần lượt: người dùng, giỏ hàng, sản phẩm, số lượng, tồn kho, sản phẩm trùng, dữ liệu sản phẩm, thông tin giao hàng. Gặp lỗi đầu tiên sẽ dừng và trả về `OrderResult` lỗi.
- `couponCode` chỉ được lưu lại, không dùng để tính giảm giá.
- Hàm không cập nhật `product.stock` và không lưu đơn hàng vào database.
