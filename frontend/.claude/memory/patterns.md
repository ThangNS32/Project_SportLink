# Patterns đã chốt — không tranh luận lại

## API & Data

**Response wrapper:** Mọi response từ backend đều có dạng `{ code, message, result }`. Luôn dùng `response.data.result` để lấy data thực, không dùng `response.data` trực tiếp.

**Enum values:** Tất cả enum gửi lên backend PHẢI lowercase: `bong_da`, `cau_long`, `pickleball`, `beginner`, `intermediate`, `advanced`, `find_team`, `find_rival`, `don_nam`, `doi_nam`, `doi_nu`, `doi_nam_nu`. Spring fail với uppercase.

**Axios instance:** Chỉ dùng instance từ `axiosConfig.js`, không tạo axios mới. Token tự động attach qua interceptor.

## Component patterns

**Avatar:** Luôn dùng `getAvatarSrc(url)` trước khi render `<img src>`. Không trực tiếp dùng URL từ API/localStorage.

**Loading/empty state:** Mọi component fetch data phải có: loading state, empty state ("Không có bài đăng"). Không để màn trắng.

**Profile: isMe check:** `const isMe = !userId || userId === "me"` — không check bằng userId === currentUserId vì route `/profile/me` dùng string "me".

## Form & Datetime

**DateTime gửi backend:** Combine `playDate` (YYYY-MM-DD) + `playTime` (HH:mm) thành `YYYY-MM-DDTHH:mm:00` (LocalDateTime format). Không gửi ISO string với timezone.

**playFormat field:** Chỉ hiện khi `sportType` là `cau_long` hoặc `pickleball`. Kiểm tra qua `SPORT_CONFIG[slug].hasPlayFormat`.

## Routing

**SportPage:** Một component dùng cho tất cả sport routes. Phân biệt API call bằng `pathname` trong useEffect. Không tạo page riêng cho từng sport.

**Header:** Không nhận `user` qua props — tự đọc từ localStorage. Không cần prop drilling.

## CSS

Mỗi page/component có file CSS riêng trong `src/styles/`. Không dùng inline style cho layout lớn.
