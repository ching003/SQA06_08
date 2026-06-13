# Hướng dẫn Kiểm thử Hiệu năng & Kiểm thử Tự động API (Module CV)

Tài liệu này cung cấp hướng dẫn chi tiết cách thiết lập, cấu hình, chạy **Kiểm thử hiệu năng (JMeter)** và **Kiểm thử tự động hóa (Postman & Newman)** cho các API thuộc phân hệ **Quản lý CV & Upload CV**.

---

## PHẦN 1: KIỂM THỬ HIỆU NĂNG VỚI APACHE JMETER

Chúng tôi đã chuẩn bị sẵn tệp cấu hình **[JobsConnect-CV-Performance-Test.jmx](file:///d:/Admin/Documents/soa/SQA/backend/BE-Jobs-connect/postman/JobsConnect-CV-Performance-Test.jmx)** chứa toàn bộ các kịch bản và API cần thiết. Bạn chỉ cần làm theo các bước dưới đây để chạy và tự thiết lập thêm nếu cần.

### 1.1. Cách tải và chạy nhanh Kế hoạch kiểm thử có sẵn
1. Khởi động JMeter GUI bằng cách chạy tệp `bin/jmeter.bat` (trên Windows).
2. Vào **File** -> **Open** -> Chọn tệp **[JobsConnect-CV-Performance-Test.jmx](file:///d:/Admin/Documents/soa/SQA/backend/BE-Jobs-connect/postman/JobsConnect-CV-Performance-Test.jmx)**.
3. Chọn thẻ **JobsConnect CV Performance Test** (ở trên cùng của cây thư mục bên trái):
   - Tại bảng **User Defined Variables**, cập nhật các giá trị biến môi trường thực tế của bạn:
     - `token`: Nhập token JWT của tài khoản test.
     - `cvId`: Nhập UUID của CV dùng để test (lấy từ database).
     - `templateId`: Nhập UUID của template CV đang hoạt động.
4. Chọn **Summary Report** ở dưới cùng.
5. Bấm nút hình **Tam giác xanh lá cây (Start)** để chạy kiểm thử và quan sát số liệu phản hồi hiển thị theo thời gian thực.

---

### 1.2. Chi tiết cấu hình từng API và từng Kịch bản (Nếu cấu hình thủ công)

#### A. Cấu hình biến dùng chung (HTTP Request Defaults & Header Manager)
1. Thêm **HTTP Request Defaults**: Server Name: `localhost`, Port: `5000`, Protocol: `http`.
2. Thêm **HTTP Header Manager**:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer ${token}` (sử dụng biến động `${token}` đã cấu hình tại Test Plan).

#### B. Cấu hình các API cụ thể (HTTP Samplers)

1. **API Lấy thông tin chi tiết CV (`GET /api/cvs/:id`)**
   - **Method**: `GET`
   - **Path**: `/api/cvs/${cvId}`
   - **Mục tiêu**: Kiểm tra tốc độ đọc bản ghi đơn lẻ có quan hệ khóa ngoại (skills, educations...).

2. **API Lấy danh sách toàn bộ CV (`GET /api/cvs`)**
   - **Method**: `GET`
   - **Path**: `/api/cvs`
   - **Parameters** (Query): `page` = `1`, `limit` = `10`
   - **Mục tiêu**: Đo hiệu năng truy vấn phân trang phía DB PostgreSQL.

3. **API Nhân bản CV (`POST /api/cvs/:id/duplicate`)**
   - **Method**: `POST`
   - **Path**: `/api/cvs/${cvId}/duplicate`
   - **Body Data** (JSON):
     ```json
     {
       "newTitle": "CV ReactJS (Bản sao)",
       "isOpenForJob": false
     }
     ```
   - **Mục tiêu**: Đánh giá hiệu năng xử lý ghi cơ sở dữ liệu đồng thời (INSERT lồng nhau).

4. **API Xuất bản/Xuất PDF (`POST /api/cvs/:id/export`)**
   - **Method**: `POST`
   - **Path**: `/api/cvs/${cvId}/export`
   - **Body Data**:
     * Kịch bản Render nặng (`forceRegenerate: true`):
       ```json
       {
         "templateId": "${templateId}",
         "forceRegenerate": true
       }
       ```
     * Kịch bản Đọc Cache nhẹ (`forceRegenerate: false`):
       ```json
       {
         "templateId": "${templateId}",
         "forceRegenerate": false
       }
       ```

#### C. Thiết lập Tải theo từng Kịch bản (Thread Groups)
Tương ứng với mỗi kịch bản, cấu hình **Thread Group** như sau:
* **Kịch bản 1 (Tải đọc nhẹ - SCEN_01)**: Number of Threads (Users): `50` | Ramp-up: `5`s | Loop Count: `10`.
* **Kịch bản 2 (Tải đọc nặng - SCEN_02)**: Number of Threads (Users): `200` | Ramp-up: `10`s | Loop Count: `5`.
* **Kịch bản 3 (Tải sinh PDF - SCEN_03)**: Number of Threads (Users): `20` | Ramp-up: `5`s | Loop Count: `1`.

---

### 1.3. Phần kiểm thử tự động hóa hiệu năng (Assertions)
Để JMeter tự động đánh giá một mẫu thử là Đạt hay Thất bại dựa trên tiêu chí hiệu năng (SLA) và tính toàn vẹn dữ liệu, chúng tôi cấu hình các **Assertions**:

1. **Kiểm tra mã trạng thái HTTP (Response Assertion)**:
   - Click chuột phải vào HTTP Request -> **Add** -> **Assertions** -> **Response Assertion**.
   - **Field to Test**: `Response Code`.
   - **Pattern Matching Rules**: `Substring`.
   - **Patterns to Test**: `200` (hoặc `201` đối với API POST tạo mới).
   - *Kết quả: Nếu server phản hồi mã 4xx hoặc 5xx, JMeter sẽ tự động đánh dấu đỏ (Fail) trên báo cáo.*

2. **Kiểm tra giới hạn thời gian phản hồi (Duration Assertion)**:
   - Click chuột phải vào HTTP Request -> **Add** -> **Assertions** -> **Duration Assertion**.
   - **Duration in Milliseconds**: Nhập thời gian tối đa theo SLA (ví dụ: `200` cho API đọc nhẹ, `2000` cho API xuất PDF).
   - *Kết quả: Bất kỳ request nào xử lý lâu hơn giới hạn sẽ bị đánh dấu Fail.*

---

## PHẦN 2: KIỂM THỬ TỰ ĐỘNG HÓA API VỚI POSTMAN & NEWMAN

Postman hỗ trợ viết các đoạn mã Javascript trong tab **Tests** của request để tự động xác minh kết quả ngay khi nhận được Response.

### 2.1. Mã tự động xác minh mẫu trong Postman (Assertions Javascript)
Bạn có thể mở tệp **[JobsConnect-CV-API.postman_collection.json](file:///d:/Admin/Documents/soa/SQA/backend/BE-Jobs-connect/postman/JobsConnect-CV-API.postman_collection.json)** để xem các test script đã được cấu hình sẵn. Các đoạn script kiểm thử tự động phổ biến gồm:

1. **Xác minh trạng thái HTTP thành công (Status Code 200/201):**
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   ```

2. **Xác minh cấu trúc dữ liệu trả về dạng JSON:**
   ```javascript
   pm.test("Response is a valid JSON", function () {
       pm.response.to.be.withBody;
       pm.response.to.be.json;
   });
   ```

3. **Kiểm tra tính đúng đắn của dữ liệu nghiệp vụ (Business Assertions):**
   ```javascript
   pm.test("Response success is true and data exists", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.success).to.eql(true);
       pm.expect(jsonData.data).to.have.property('id');
       pm.expect(jsonData.data.isMain).to.eql(false); // Đảm bảo CV nhân bản hoặc tạo mới mặc định không phải CV chính
   });
   ```

4. **Kiểm tra thời gian phản hồi API (SLA Response Time):**
   ```javascript
   pm.test("Response time is less than 300ms", function () {
       pm.expect(pm.response.responseTime).to.be.below(300);
   });
   ```

---

### 2.2. Chạy kiểm thử tự động hóa hàng loạt với Newman (CLI Runner)
Để tích hợp kiểm thử API tự động vào luồng CI/CD hoặc chạy nhanh qua dòng lệnh không cần giao diện Postman:

1. **Cài đặt Newman toàn cục qua Node.js (npm):**
   ```bash
   npm install -g newman
   ```
2. **Chạy kiểm thử tự động toàn bộ API CV:**
   Di chuyển terminal vào thư mục chứa collection:
   ```bash
   cd d:\Admin\Documents\soa\SQA\backend\BE-Jobs-connect\postman
   ```
   Chạy lệnh thực thi collection kết hợp file môi trường:
   ```bash
   newman run JobsConnect-CV-API.postman_collection.json -e JobsConnect-Development.postman_environment.json
   ```
3. **Kết quả:** Newman sẽ chạy lần lượt toàn bộ 16 API CV, thực hiện hàng chục xác minh tự động và in ra bảng thống kê kết quả Pass/Fail trực quan ngay trên terminal.
