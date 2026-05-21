# Decision Log — SportLink

## Format mỗi entry

**Date:** YYYY-MM-DD
**Module:** [frontend / backend / shared]
**File:** path/to/file
**Decision:** Đổi [CÁI GÌ]
**Reason:** Vì [LÝ DO]
**Rejected alternatives:** Đã thử [X] nhưng không được vì [Y]

---

## Entries

---

**Date:** 2026-04-22
**Module:** frontend/backend
**File:** axiosConfig.js / SecurityConfig.java
**Decision:** Backend enum values gửi từ frontend → backend đều phải lowercase
**Reason:** Spring Boot deserializer fail với uppercase enum. Ví dụ: `bong_da`, `beginner`, `find_team`, `don_nam`.
**Rejected alternatives:** Thêm custom deserializer ở backend — phức tạp hơn, không cần thiết khi frontend chuẩn hóa được.

---

**Date:** 2026-04-22
**Module:** frontend
**File:** axiosConfig.js
**Decision:** Khi nhận 401, show popup countdown 3 giây rồi clear localStorage và redirect về `/`
**Reason:** UX tốt hơn là redirect thẳng — user kịp thấy thông báo session hết hạn.
**Rejected alternatives:** Redirect ngay lập tức — confusing với user.

---

**Date:** 2026-04-22
**Module:** frontend
**File:** ProfilePage.jsx
**Decision:** `sportApi.replaceAllSports()` — thay thế toàn bộ danh sách sports khi save, không patch từng cái
**Reason:** Đơn giản hơn, backend endpoint hỗ trợ replace-all pattern.
**Rejected alternatives:** PATCH từng sport — cần thêm add/remove endpoint, phức tạp hơn không cần thiết.

---
