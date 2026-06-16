# Session Log — SportLink Frontend

## Template

### [DATE]

**Đang làm:** [feature/bug đang xử lý]
**Đến đâu rồi:** [hoàn thành X, đang Y, chưa làm Z]
**Files đã sửa:**
- path/to/file — [thay đổi gì]
**Blocker:** [nếu có]
**Việc tiếp theo:** [làm gì session sau]

---

## Log

### 2026-04-22

**Đang làm:** Thiết lập memory system cho project SportLink
**Đến đâu rồi:** Xong. Đã có decisions.md, session-log.md, bugs-solved.md, patterns.md, hooks, commands /log /why /decide.
**Files đã sửa:**
- .claude/memory/decisions.md — khởi tạo với 3 decision đầu tiên từ CLAUDE.md
- .claude/memory/patterns.md — patterns đã chốt từ codebase hiện tại
- .claude/memory/bugs-solved.md — khởi tạo
- .claude/settings.local.json — thêm hooks SessionStart, Stop, PostToolUse
- .claude/commands/log.md, why.md, decide.md — slash commands
**Blocker:** Không có
**Việc tiếp theo:** Dùng /decide khi đổi logic lớn, /log cuối mỗi session

---

### 2026-04-22 (session 2)

**Đang làm:** Build backend API cho Posts và Sports domain
**Đến đâu rồi:** Backend xong hoàn toàn. Frontend chưa wire vào (chỉ có App.jsx/CSS setup cơ bản).
**Files đã sửa:**
- backend/controller/PostController.java — CRUD posts, GET /api/posts (filter by sportType/postType/radius), GET /api/posts/search (filter by skill/date/time/format/slots/distance), GET /api/posts/me, POST/PUT/DELETE
- backend/controller/SportController.java — GET/POST/DELETE /api/users/me/sports, PUT /api/users/me/sports (replace-all), GET /api/users/{userId}/sports
- backend/controller/UserController.java — cập nhật profile endpoints
- backend/entity/ — thêm Sport, SportPost, enums: SkillLevel, PlayFormat, PostType, PostStatus, SportType, DistanceRange, SlotsRange
- backend/dto/request & response — CreatePostRequest, UpdatePostRequest, SportPostResponse, UserSportResponse, AddUserSportRequest, UpdateFavoriteSportsRequest
- backend/service/PostService, SportService, UserService, FileStorageService — business logic
- backend/repository/SportPostRepository, SportRepository — JPA queries
- backend/mapper/SportPostMapper, UserMapper — entity↔DTO mapping
- backend/scheduler/PostScheduler — auto-expire posts
- backend/configuration/WebConfig, SecurityConfig — CORS + security rules
- frontend/src/App.jsx, App.css, index.css, vite.config.js — setup cơ bản (chưa có feature components)
**Blocker:** Không có
**Việc tiếp theo:** Wire frontend vào backend API — tạo api/postApi.js, api/sportApi.js, các components PostCard/PostList/FilterSidebar/CreatePostModal, SportPage, ProfilePage

---

### 2026-04-22 (session 3)

**Đang làm:** Học và test memory system (.claude folder)
**Đến đâu rồi:** Xong. Đã hiểu ý nghĩa từng file/folder trong .claude/, test thành công /why và /log.
**Files đã sửa:** Không có (session học, không code)
**Blocker:** Không có
**Việc tiếp theo:** Bắt đầu build frontend — wire vào backend API đã có sẵn

---

### 2026-04-23

**Đang làm:** Học/hiểu code Map cho phần tạo bài đăng — LocationPicker.jsx với Leaflet
**Đến đâu rồi:** Đã hiểu toàn bộ: LocationPicker, MapFlyTo, MapClickHandler, MapContainer, TileLayer, Marker. Chưa làm: ghép Map với bộ lọc FilterSidebar, gắn marker cho các sân/địa điểm từ API.
**Files đã sửa:** Không có (session học, không code)
**Blocker:** Không có
**Việc tiếp theo:** Ghép Map với bộ lọc + gắn marker cho các sân/địa điểm từ API. Có thể làm thêm tính năng chỉ đường trên Map.

---

### 2026-04-24

**Đang làm:** Build LocationPicker — bản đồ chọn sân cho chức năng tạo bài đăng + split thành các file nhỏ
**Đến đâu rồi:** Xong phần bản đồ ở CreatePostModal. Chưa làm: gắn bản đồ vào FilterSidebar để lọc theo địa điểm, tính năng chỉ đường.
**Files đã sửa:**
- frontend/src/components/common/LocationPicker.jsx — rewrite hoàn toàn: split-panel (list trái + map phải), Overpass API nearby venues, Nominatim search, custom pin (click map → lưu localStorage), city selector sync
- frontend/src/styles/location-picker.css — rewrite với light theme, split layout
- frontend/src/components/common/locationPicker/api.js — fetchNearbyVenues, searchNominatim, searchOverpass, SPORT_ALIASES (fix "cầu lông" → "badminton")
- frontend/src/components/common/locationPicker/icons.js — Leaflet icon fix + 4 icons (venue/selected/user/pending)
- frontend/src/components/common/locationPicker/utils.js — DEFAULT_CENTER, haversineKm, formatDist, formatAddress
- frontend/src/components/common/locationPicker/storage.js — loadCustomVenues, saveCustomVenues (localStorage)
- frontend/src/components/common/locationPicker/VenueList.jsx — danh sách sân bên trái
- frontend/src/components/common/locationPicker/VenueMap.jsx — map + MapController + MapClickHandler
- frontend/src/components/common/locationPicker/PendingPinForm.jsx — form đặt tên khi click map
- frontend/src/data/staticVenues.js — tạo mới (rỗng, để admin thêm sân tĩnh sau)
- frontend/src/components/common/Header.jsx — thêm CITY_COORDS, click chọn thành phố → lưu userLat/userLng
- frontend/src/components/post/CreatePostModal.jsx — truyền sportType prop vào LocationPicker
**Blocker:** Không có
**Việc tiếp theo:** Gắn bản đồ vào FilterSidebar để lọc theo địa điểm + thêm tính năng chỉ đường trên Map

---

### 2026-05-04 (session 1)

**Đang làm:** Thiết kế + code multi-select venue picker cho FilterSidebar
**Đến đâu rồi:** Code đã show xong (trong chat), chưa paste vào dự án. Chưa test.
**Files đã sửa:** Không có (chưa add vào dự án)
**Code cần paste:**
- LocationPicker.jsx — thêm prop `multiSelect`, `selected` đổi thành array khi multi, `selectedIds` (Set) truyền xuống VenueMap
- locationPicker/VenueList.jsx — thêm checkbox khi `multiSelect=true`
- locationPicker/VenueMap.jsx — thay prop `selected` bằng `selectedIds` (Set)
- FilterSidebar.jsx — thay placeholder bằng venue picker thật, nhận props `selectedVenues`/`setSelectedVenues`
- SportPage.jsx — thêm state `selectedVenues`, truyền xuống FilterSidebar, filter client-side
- location-picker.css — thêm `.lp-checkbox` và `.lp-checkbox--checked`
**Blocker:** Không có
**Việc tiếp theo:** Add code vào dự án và test chạy

---

### 2026-05-04 (session 2)

**Đang làm:** Add multi-select venue picker vào dự án + fix bugs + performance
**Đến đâu rồi:** Code đã paste xong vào tất cả 7 file, chưa test trên browser.
**Files đã sửa:**
- locationPicker/VenueList.jsx — thêm props `multiSelect`, `selectedIds`, hiển thị checkbox thay radio
- locationPicker/VenueMap.jsx — thêm prop `selectedIds` (Set), icon marker dùng Set thay single `selected`
- LocationPicker.jsx — thêm prop `multiSelect`, state `selectedList`, toggle logic, `selectedIds` computed, footer khác nhau theo mode
- FilterSidebar.jsx — import LocationPicker, thêm `selectedVenues`/`setSelectedVenues` props, state `showVenuePicker`, thay placeholder bằng button + chips
- SportPage.jsx — thêm state `selectedVenues`, reset, filter client-side theo tên sân
- location-picker.css — thêm `.lp-checkbox`, `.lp-checkbox--checked`
- sport-page.css — thêm `.sp-venue-btn`, `.sp-venue-chips`, `.sp-venue-chip`, `.sp-venue-chip-x`; fix CSS trùng lặp
- vite.config.js — đổi sang `@vitejs/plugin-react-swc` (SWC) + thêm `optimizeDeps.include` cho leaflet
**Bugs đã fix trong session:**
- `selectedIds` bị thiếu trong LocationPicker.jsx (chưa có dòng `const selectedIds = ...`)
- Props `selectedVenue`/`setSelectedVenue` (thiếu 's') trong FilterSidebar.jsx
- Dấu `;` thừa giữa các `.filter()` chain trong SportPage.jsx
- CSS sport-page.css bị paste trùng nhiều lần, có lỗi `transition: background (0.15s` thừa dấu `(`
**Blocker:** Không có
**Việc tiếp theo:** Test chạy toàn bộ flow venue picker trên browser, fix bug nếu có

---

### 2026-05-05

**Đang làm:** Fix Vite chậm, fix LocationPicker không load được sân, xóa custom pin, xóa custom venues khỏi localStorage
**Đến đâu rồi:** Xong hoàn toàn. LocationPicker.jsx, VenueMap.jsx, storage.js đã sửa và verified đúng.
**Files đã sửa:**
- frontend/vite.config.js — thêm `optimizeDeps.include` cho leaflet/@react-leaflet/core, `holdUntilCrawlEnd: false`; fix zombie Vite process + APFS picomatch corruption
- frontend/src/components/common/locationPicker/storage.js — xóa custom venues, thay bằng `loadNearbyCache`/`saveNearbyCache` (TTL 6h, key theo lat/lng)
- frontend/src/components/common/locationPicker/api.js — giảm radius 20km→8km, timeout 20s→8s, thêm `amenity=sports_centre`/`leisure=stadium`, catch error trả `[]`
- frontend/src/components/common/LocationPicker.jsx — xóa custom pin (click map), xóa customMatches, dùng clientMatches/mergedDisplayList đơn giản; thêm stale-while-revalidate cache
- frontend/src/components/common/locationPicker/VenueMap.jsx — xóa MapClickHandler, pendingPin, onMapClick props
**Blocker:** Không có
**Việc tiếp theo:** Gắn API vào bộ lọc (FilterSidebar search gọi backend thật thay vì client-side filter)

---

### 2026-05-05 (session 2)

**Đang làm:** Ghép API bộ lọc vào FilterSidebar/SportPage — đổi `slotsFilter`→`slotsRange`, `radiusKm`→`distanceRange`, fix các bug thừa
**Đến đâu rồi:** Xong hoàn toàn. Bộ lọc đã test ổn.
**Files đã sửa:**
- frontend/src/pages/SportPage.jsx — đổi state `slotsFilter`→`slotsRange`, `radiusKm`→`distanceRange`; thêm `searchLat`/`searchLng` dùng venue lat/lng khi có; xóa `isSearchMode`, `searchText`, `navigate`, `SKILL_LEVELS`/`PLAY_FORMATS` imports thừa; xóa filter client-side; fix `resetFilters` reset `postType` đúng theo pathname
- frontend/src/components/post/FilterSidebar.jsx — đổi props `slotsFilter`→`slotsRange`, `radiusKm`→`distanceRange`; đổi option values slots thành enum (`one_to_two`, `three_to_four`, `five_plus`); đổi option values distance thành enum (`under_1`..`under_20`); thêm option "Tất cả" và "Không giới hạn" với `value=""`
**Blocker:** Không có
**Việc tiếp theo:** Kết nối Google Maps để chỉ đường từ vị trí user đến sân

---

### 2026-05-06

**Đang làm:** Ghép API search bộ lọc + gắn link Google Maps chỉ đường vào PostCard
**Đến đâu rồi:** Xong hoàn toàn. Cả hai tính năng đã test ổn.
**Files đã sửa:**
- frontend/src/components/post/PostCard.jsx — thêm `getDirectionsUrl()`; location name đổi thành thẻ `<a>` với class `pc-location--link`; hover → đổi màu xanh + gạch chân; click → mở Google Maps chỉ đường (dùng GPS user làm điểm xuất phát, tọa độ sân làm điểm đến); fallback chỉ hiện sân nếu không có GPS
- frontend/src/styles/sport-page.css — thêm `.pc-location--link` và `.pc-location--link:hover`; xóa `.pc-location-wrap`, `.pc-map-btn` cũ
**Blocker:** Không có
**Việc tiếp theo:** Chat người với người dùng WebSocket

---

### 2026-05-06 (session 2)

**Đang làm:** Tách sport-page.css thành các file nhỏ theo component + thảo luận kiến trúc tính năng chat
**Đến đâu rồi:** Xong hoàn toàn. CSS đã tách và import đúng. Thảo luận join_requests vs chat chỉ là plan, chưa code.
**Files đã sửa:**
- frontend/src/styles/sport-page.css — giữ lại chỉ layout SportPage (sp-page, sp-body, sp-sidebar container, sp-main, banner, meta, loc dropdown, responsive); xóa sp-card* cũ (dead code)
- frontend/src/styles/filter-sidebar.css — tạo mới, chứa toàn bộ styles FilterSidebar (sp-filter-*, sp-chip*, sp-search-*, sp-select, sp-checkbox*, sp-search-btn, sp-venue-*)
- frontend/src/styles/post-card.css — tạo mới, chứa toàn bộ styles PostCard (pc-*)
- frontend/src/components/post/FilterSidebar.jsx — thêm import filter-sidebar.css
- frontend/src/components/post/PostCard.jsx — thêm import post-card.css
**Blocker:** Không có
**Việc tiếp theo:** Suy nghĩ thêm về kiến trúc chat real-time (WebSocket) — join_requests cần làm trước để có context cho chat nhóm

---

### 2026-05-08

**Đang làm:** Tách file tối ưu + hoàn thiện trang cá nhân người dùng khác
**Đến đâu rồi:** Xong hoàn toàn.
**Files đã sửa:**
- frontend/src/components/profile/ProfileCard.jsx — tạo mới, tách từ ProfilePage
- frontend/src/components/profile/EditProfileModal.jsx — tạo mới, tách từ ProfilePage
- frontend/src/components/profile/EditPostModal.jsx — tạo mới, tách từ ProfilePage
- frontend/src/pages/ProfilePage.jsx — rút gọn từ 654 → ~140 dòng, import 3 component mới
- frontend/src/components/common/header/LocationDropdown.jsx — tạo mới, tách từ Header
- frontend/src/components/common/header/UserDropdown.jsx — tạo mới, tách từ Header
- frontend/src/styles/header.css — tạo mới, chứa inline styles từ Header (hd-loc-*, hd-sports-*)
- frontend/src/components/common/Header.jsx — rút gọn từ 407 → ~80 dòng, fix bug duplicate useEffect
- frontend/src/components/post/PostCard.jsx — click tên/avatar → navigate /profile/{userId}
- backend/PostController.java — thêm GET /api/posts/user/{userId}?userLat&userLng
- backend/PostService.java — thêm getUserActivePosts(userId, userLat, userLng) tính distanceKm
- backend/SportPostRepository.java — thêm findByUser_UserIdAndStatus
- frontend/src/api/postApi.js — thêm getUserPosts(userId, params)
- Project_SportLink/schema.sql — tạo mới, lưu toàn bộ DB schema 10 bảng
- Project_SportLink/CLAUDE.md — thêm Chat Feature Design (flow tham gia → chat → chấp nhận → trừ slots)
**Blocker:** Không có
**Việc tiếp theo:** Build tính năng chat + join_requests theo flow: ấn "Tham gia" → gửi tin nhắn mặc định → chat 1-1 → chủ bài Chấp nhận/Từ chối → trừ slots. Dùng Firebase Firestore cho real-time chat + Spring Boot cho business logic (slots, join_requests).

---

### 2026-05-11

**Đang làm:** Build tính năng chat + join_requests (Firebase Firestore + Spring Boot)
**Đến đâu rồi:** Xong hoàn toàn, đã test chạy ổn.
**Files đã sửa:**
- frontend/src/components/chat/firebase.js — tạo mới, khởi tạo Firebase + export Firestore db
- frontend/src/components/chat/joinRequestApi.js — tạo mới, gọi API join-requests (create/accept/reject/conversations)
- frontend/src/components/chat/notificationApi.js — tạo mới, gọi API notifications (getUnread/markRead)
- frontend/src/components/chat/chat.css — tạo mới, toàn bộ styles cho chat page
- frontend/src/components/chat/ConversationList.jsx — tạo mới, sidebar danh sách conversations
- frontend/src/components/chat/ChatWindow.jsx — tạo mới, cửa sổ chat real-time (onSnapshot Firestore), nút Accept/Reject cho chủ bài
- frontend/src/components/chat/ChatPage.jsx — tạo mới, layout 2 cột + tạo Firestore document khi navigate từ PostCard
- frontend/src/App.jsx — thêm route /chat và /chat/:conversationId
- frontend/src/components/post/PostCard.jsx — thêm nút "Tham gia"/"Giao hữu", fix duplicate import, fix nút đặt sai trong isOwner block
- frontend/src/components/common/Header.jsx — wire nút chuông (polling notifications 10s, badge đỏ, dropdown), wire nút chat (navigate /chat)
- backend/entity/JoinRequest.java — tạo mới, map bảng join_requests
- backend/entity/Notification.java — tạo mới, map bảng notifications
- backend/entity/RequestStatus.java, RequestType.java, NotificationType.java — tạo mới, 3 enum
- backend/repository/JoinRequestRepository.java — tạo mới, existsByPost+Requester, findMyConversations (JPQL OR), findByRequestId+OwnerId
- backend/repository/NotificationRepository.java — tạo mới, findUnread, findAll by userId
- backend/dto/request/CreateJoinRequestRequest.java — tạo mới
- backend/dto/response/JoinRequestResponse.java, NotificationResponse.java — tạo mới
- backend/service/JoinRequestService.java — tạo mới, createJoinRequest/accept/reject/getMyConversations + business logic slots
- backend/service/NotificationService.java — tạo mới, createJoinNotification/createResponseNotification/getUnread/markRead
- backend/controller/JoinRequestController.java, NotificationController.java — tạo mới
- backend/exception/ErrorCode.java — thêm POST_NOT_AVAILABLE(3005)
**Blocker:** Không có
**Việc tiếp theo:** Chỉnh UI chat cho đẹp hơn (layout, màu sắc, animation tin nhắn, v.v.)

---

### 2026-05-12

**Đang làm:** Fix bugs + polish UI chat, refactor Header.jsx
**Đến đâu rồi:** Xong hoàn toàn, đã verified tất cả.
**Files đã sửa:**
- frontend/src/components/chat/chat.css — dark theme toàn bộ chat page, fix white strip ở bottom (`body:has(.chat-page)`), thêm `.chat-list__unread-badge`, `.chat-sidebar__header`, `.chat-back-btn`
- frontend/src/components/chat/ChatPage.jsx — thêm nút quay về `/feed`, fix duplicate messages (đổi `addDoc` → `setDoc` với fixed ID `"initial"` để tránh React StrictMode double-invoke), tách `fetchConversations()` làm hàm riêng, truyền `onStatusChange={fetchConversations}` vào ChatWindow
- frontend/src/components/chat/ChatWindow.jsx — thêm `onStatusChange` prop, cập nhật `lastRead` theo key user-specific (`lastRead_${userId}_${convId}`), gọi `onStatusChange?.()` sau Accept/Reject để ConversationList refresh ngay không cần reload
- frontend/src/components/chat/ConversationList.jsx — thêm unread badge (số tin chưa đọc), bold text khi có tin mới, fix localStorage key để tránh cross-user contamination khi test 2 tài khoản trên 1 máy
- frontend/src/components/common/Header.jsx — refactor 396 → 189 dòng, tách logic ra 3 file riêng trong `header/`
- frontend/src/components/common/header/useNotifications.js — tạo mới, custom hook polling notifications 10s
- frontend/src/components/common/header/useChatUnread.js — tạo mới, custom hook Firestore listeners cho badge chat trên header (hoạt động ở mọi trang, không chỉ /chat)
- frontend/src/components/common/header/NotificationBell.jsx — tạo mới, tách UI notification bell + dropdown
- frontend/src/components/post/PostCard.jsx — xóa prop `onJoin` (dead code), đổi `⭐` → `★`, fix font tên tác giả + điểm trust
- frontend/src/components/post/PostList.jsx — xóa prop `onJoin`
- frontend/src/pages/SportPage.jsx — xóa `onJoin` khỏi PostList
- frontend/src/styles/post-card.css — thêm `.pc-author-name`, `.pc-trust` với font system-ui
**Blocker:** Không có
**Việc tiếp theo:** Build tính năng đánh giá độ uy tín (trust score) — user đánh giá nhau sau trận với điều kiện cụ thể để được quyền đánh giá. Và đọc/giải thích code theo yêu cầu.

---

### 2026-05-13

**Đang làm:** Thiết kế hệ thống đánh giá uy tín (trust score / rating)
**Đến đâu rồi:** Đã chốt xong ý tưởng đầy đủ, chưa bắt đầu implement.
**Files đã sửa:** Không có (session thiết kế)
**Blocker:** Không có

**Ý tưởng đã chốt — Hệ thống đánh giá uy tín:**

_Điều kiện được phép đánh giá:_
- Status join request = `accepted`
- `playDate` đã qua
- Chưa đánh giá lần nào (1 cặp người / 1 request)
- 2 chiều: người xin join đánh giá chủ bài, chủ bài đánh giá người xin join

_Nội dung đánh giá:_
- Số sao: 1 → 5
- Nhãn (multi-select): Không uy tín / Thái độ không đẹp / Không đến đúng hẹn / Uy tín / Thái độ tốt

_Blind Review (chống trả thù):_
- Cả 2 bên submit độc lập, không thấy của nhau
- Reveal khi cả 2 đã submit HOẶC sau 3 ngày kể từ playDate
- Trong thời gian chờ hiện "Đang chờ đánh giá"

_Hiển thị điểm:_
- PostCard: ★ TB + (N đánh giá) — hiện từ 1 lượt trở lên
- ProfilePage: ★ TB + (N đánh giá) trong phần thông tin cá nhân
- ChatWindow banner accept/reject: ★ TB + (N đánh giá) của người kia

_Cảnh báo & khoá tài khoản:_
- Điểm TB ≤ 2, < 3 lượt → badge cảnh báo trên profile
- Điểm TB ≤ 2, ≥ 3 lượt → tự động khoá 7 ngày + thông báo
- Tài khoản bị khoá → không thể đăng bài, không thể xin join

_Kỹ thuật:_
- Bảng ratings: id, raterId, ratedUserId, requestId, stars, tags[], isRevealed, createdAt
- Khi submit → lưu isRevealed=false → kiểm tra nếu cả 2 đã submit thì reveal ngay
- Scheduled job hàng ngày: playDate + 3 ngày đã qua → set isRevealed=true
- Reveal → tính lại trustScore + ratingCount → nếu ≤2 và ≥3 lượt → lock account

**Việc tiếp theo:** Implement hệ thống rating — backend trước (entity/service/controller), rồi frontend (modal đánh giá, hiển thị điểm trên PostCard/ProfilePage/ChatWindow)

---

### 2026-05-14

**Đang làm:** Implement backend hệ thống đánh giá uy tín (rating system)
**Đến đâu rồi:** Backend xong hoàn toàn. Frontend chưa làm.
**Files đã tạo mới:**
- `backend/entity/RatingTag.java` — enum 5 nhãn: khong_uy_tin, thai_do_khong_dep, khong_dung_hen, uy_tin, thai_do_tot
- `backend/entity/Rating.java` — entity map bảng ratings + bảng phụ rating_tags (@ElementCollection)
- `backend/repository/RatingRepository.java` — 4 method: existsByRater, findByRequestAndUnrevealed, findAvgStars, countRevealed, findRevealable
- `backend/dto/request/CreateRatingRequest.java` — requestId, stars (@Min1 @Max5), tags
- `backend/dto/response/RatingResponse.java` — ratingId, stars, tags, isRevealed, message
- `backend/service/RatingService.java` — submitRating, revealRatings, recalculateTrustScore, determineRatedUser
- `backend/controller/RatingController.java` — POST /api/ratings
- `backend/scheduler/RatingScheduler.java` — @Scheduled chạy 2:00 sáng, cutoff = today-3days.atStartOfDay()
- `schema.sql` — thêm cột is_revealed vào ratings, thêm bảng rating_tags
**Files đã sửa:**
- `backend/service/NotificationService.java` — thêm createBanNotification()
- `backend/service/UserService.java` — sửa banUser() bỏ setIsActive(false), xóa updateTrustScore() (dead code + sai logic)
- `backend/service/AuthService.java` — thêm check banUntil trong refreshToken()
- `backend/service/PostService.java` — thêm check banUntil trong createPost()
- `backend/service/JoinRequestService.java` — thêm check banUntil trong createJoinRequest()
- `backend/Application.java` — thêm @EnableScheduling
- `vite.config.js` — thêm firebase/app, firebase/firestore vào optimizeDeps.include (fix load chậm)
**Blocker:** Không có
**Việc tiếp theo:** Build frontend rating — modal đánh giá trong ChatWindow, hiển thị ★ TB + số lượt trên PostCard + ProfilePage + ChatWindow banner

---

### 2026-05-18

**Đang làm:** Hoàn thiện frontend rating system + chức năng ban user
**Đến đâu rồi:** Xong hết, tối test nốt.
**Files đã sửa:**
- `frontend/src/components/chat/chat.css` — xóa toàn bộ comments
- `frontend/src/components/chat/ChatWindow.jsx` — thêm isBanned check, disable input/send khi bị ban
- `frontend/src/components/common/Header.jsx` — thêm ban popup (class-based CSS), lưu/xóa banUntil localStorage, isBanned check chat icon, thêm banUntil vào logout cleanup
- `frontend/src/components/common/header/useNotifications.js` — tách banned notification khỏi bell → banMessage state; fix handleClickNotif với guard `if (notif.refId)`; trả về banMessage/setBanMessage
- `frontend/src/components/post/FilterSidebar.jsx` — thêm isBanned check nút tìm kiếm, xóa prop `sport` unused
- `frontend/src/pages/SportPage.jsx` — thêm isBanned helper, check trên nút tạo bài
- `frontend/src/styles/header.css` — thêm .ban-overlay, .ban-modal, .ban-modal__desc, .ban-modal__note, .ban-modal__btn
- `frontend/src/components/profile/ProfileCard.jsx` — click "(N đánh giá)" → fetch + hiện tag frequency popup
- `frontend/src/styles/profile.css` — thêm .pf-trust-clickable, .pf-tags-popup, .pf-rtag, .pf-rtag--pos, .pf-rtag--neg
- `frontend/src/api/ratingApi.js` — thêm getUserRatingTags(userId)
- `backend/entity/NotificationType.java` — thêm `rated`
- `backend/service/NotificationService.java` — thêm createRatingNotification(rater, rated, stars, tags, requestId)
- `backend/service/RatingService.java` — fix rater→currentUser, thêm getUserRatingTags, gọi createRatingNotification
- `backend/dto/response/UserResponse.java` — thêm field banUntil
- `backend/mapper/UserMapper.java` — thêm @Mapping banUntil (LocalDateTime→String)
- `backend/repository/SportPostRepository.java` — thêm findByStatusInAndPlayTimeBefore (fix expire matched/full posts)
- `backend/scheduler/PostScheduler.java` — fix expire cả status open+matched+full
- `backend/repository/RatingRepository.java` — thêm findByRated_UserIdAndIsRevealedTrue
- `backend/controller/RatingController.java` — thêm GET /api/ratings/user/{userId}
**Bugs đã fix:**
- PostScheduler chỉ expire status=open, bỏ sót matched/full → fix dùng findByStatusIn
- SQL ENUM column `type` chưa có `rated` → ALTER TABLE notifications MODIFY COLUMN type
- `rater` undefined trong RatingService → đổi thành `currentUser`
- `useState` đặt ngoài component trong ProfileCard → moved inside
- Fragment thiếu `</>` trong Header.jsx return
- Prop `sport` unused trong FilterSidebar → xóa
**Blocker:** Không có
**Việc tiếp theo:** Build chatbot

---

### 2026-05-20

**Đang làm:** Build chatbot AI (DeepSeek) + fix bugs liên quan
**Đến đâu rồi:** Xong, cần test thêm.
**Files đã sửa:**
- `backend/service/ChatbotService.java` — tạo mới hoàn chỉnh: RAG hướng 2 (dump all posts), tính distanceKm, detectCity, getCurrentUser, parse JSON response có fallback, clean markdown, inject userInfo vào context
- `backend/controller/ChatbotController.java` — tạo mới, nhận ChatbotRequest, trả ChatbotResponse
- `backend/dto/request/ChatbotRequest.java` — tạo mới: message + userLat + userLng
- `backend/dto/response/ChatbotResponse.java` — tạo mới: message + List<SportPostResponse>
- `backend/exception/GlobalExceptionHandler.java` — fix bug: đổi `getCode() >= 500 ? 500 : 400` → `400` (tất cả AppException đều trả 500 sai)
- `frontend/src/api/chatbotApi.js` — tạo mới, gửi JSON {message, userLat, userLng}
- `frontend/src/components/common/ChatbotWidget.jsx` — tạo mới: floating widget, render PostCard khi AI trả về posts, isLoggedIn dùng state + custom event
- `frontend/src/styles/chatbot.css` — tạo mới: dark theme, pill button gradient, cb-post-list
- `frontend/src/components/common/AuthModal.jsx` — thêm dispatchEvent("userLogin")
- `frontend/src/pages/auth/GoogleCallbackPage.jsx` — thêm dispatchEvent("userLogin"), đổi navigate("/login") → navigate("/")
- `frontend/src/App.jsx` — xóa import + route LoginPage, RegisterPage (dead code)
- `frontend/src/pages/auth/LoginPage.jsx` — xóa file
- `frontend/src/pages/auth/RegisterPage.jsx` — xóa file
- `frontend/src/components/chat/ChatWindow.jsx` — fix handleRespond: catch REQUEST_NOT_PENDING (code 3003) → sync Firestore thay vì alert
**Bugs đã fix:**
- `p.getTitle()` không tồn tại trong SportPost → đổi thành `p.getTeamName()`
- ChatbotService hardcode query hôm nay → đổi sang query 365 ngày tới
- AI trả lời sai khi hỏi theo thành phố → thêm detectCity() vào context
- AI hiện postId trong response → thêm vào prompt "không đề cập postId trong message"
- AI trả lời sai postType (find_rival vs find_team) → thêm postType vào context
- ChatbotWidget không hiện sau login → đổi isLoggedIn thành state + custom event "userLogin"
- LoginPage/RegisterPage là dead code → xóa
- GlobalExceptionHandler trả HTTP 500 cho mọi AppException → sửa thành 400
- ChatWindow: click từ chối lần 2 → 500 vì Firestore chưa sync với MySQL → fix catch NOT_PENDING
**Blocker:** Không có
**Việc tiếp theo:** Test thêm chatbot và deploy

---

### 2026-05-20 (session 2)

**Đang làm:** Chatbot AI (DeepSeek) — fix backend, lọc và trả lời câu hỏi tìm kiếm bằng AI
**Đến đâu rồi:** Xong chatbot, cần test thêm các trường hợp edge case.
**Files đã sửa:** Không có thay đổi mới (tiếp nối session 1)
**Blocker:** Không có
**Việc tiếp theo:** Test thêm chatbot và deploy

---

### 2026-05-20 (session 3)

**Đang làm:** Test chatbot + thảo luận kỹ thuật (Minimax, RAG, ML)
**Đến đâu rồi:** Đã fix xong 2 bug chatbot: (1) sai ngày "tối nay" — inject LocalDate.now() vào enrichedMessage; (2) không tìm được theo quận — thêm hướng dẫn vào SYSTEM_PROMPT để AI dùng locationName match quận. Phần thảo luận: hiểu cách làm bot TicTacToe không thể thắng (Minimax, không cần train), hiểu RAG vs fine-tuning, hiểu khi nào SportLink cần ML (không cần).
**Files đã sửa:**
- `backend/service/ChatbotService.java` — inject ngày hôm nay vào enrichedMessage, thêm hướng dẫn match quận vào SYSTEM_PROMPT
**Blocker:** Không có
**Việc tiếp theo:** Tạo thêm nhiều bài đăng để test chatbot đa dạng hơn, sau đó deploy

---

### 2026-05-21

**Đang làm:** Fix chatbot bugs + thêm tính năng xóa conversation trong chat
**Đến đâu rồi:** Xong hết. Deploy là việc còn lại.
**Files đã sửa:**
- `backend/service/ChatbotService.java` — fix buildContext(): tách `Ngày:` và `Giờ:` thành 2 field riêng (trước là `Giờ: HH:mm dd/MM/yyyy` khiến AI không match được ngày); thêm hướng dẫn SYSTEM_PROMPT: tìm toàn bộ danh sách kể cả bài xa trong tương lai, định nghĩa buổi sáng/trưa/chiều/tối theo giờ cụ thể; tăng cường rule không hiện postId trong message (thêm ví dụ SAI/ĐÚNG)
- `frontend/src/components/chat/ConversationList.jsx` — thêm nút ✕ xóa conversation: hover hiện nút, click → window.confirm → xóa Firestore messages subcollection + conversation doc → lưu convId vào localStorage (`hiddenConvs_{userId}`) để persist qua F5 → gọi onDelete(convId) để filter khỏi state
- `frontend/src/components/chat/ChatPage.jsx` — thêm prop `onDelete` cho ConversationList; `fetchConversations` filter ra các convId đã lưu trong localStorage trước khi setConversations; xóa dòng `navigate("/chat")` trong handleDelete (gây ChatPage remount → fetchConversations → conversation reappear)
- `frontend/src/components/chat/chat.css` — thêm `.chat-list__delete-btn` (opacity 0 mặc định, pointer-events none, hiện khi hover item)
**Bugs đã fix:**
- Chatbot trả lời sai ngày → tách Ngày/Giờ trong context
- Chatbot bỏ sót bài đăng xa trong tương lai → thêm instruction SYSTEM_PROMPT
- Chatbot vẫn hiện postId trong message → tăng cường rule với ví dụ cụ thể
- Xóa conversation xong vẫn reappear sau F5 → localStorage hiddenConvs
- Xóa conversation xong reappear ngay lập tức → navigate("/chat") gây remount → đã xóa dòng navigate
**Blocker:** Không có
**Việc tiếp theo:** Deploy — backend lên Railway (hoặc Render), frontend lên Cloudflare Pages, đổi baseURL trong axiosConfig.js

---

### 2026-05-25

**Đang làm:** Fix bugs sau khi deploy lên production (Render + Vercel + Aiven)
**Đến đâu rồi:** Xong hết, đã test trên production.
**Files đã sửa:**
- `frontend/src/components/post/FilterSidebar.jsx` — dùng `createPortal` để render LocationPicker vào `document.body`, tránh bị clip bởi `overflow-y: auto` của sidebar
- `backend/src/main/java/com/sportlink/backend/Application.java` — thêm `TimeZone.setDefault(Asia/Ho_Chi_Minh)` trước khi app khởi động, fix lệch 7 tiếng giữa server UTC và giờ Việt Nam
- `backend/src/main/java/com/sportlink/backend/service/RatingService.java` — xóa `createRatingNotification` khỏi `submitRating`, chuyển vào `revealRatings` để notification chỉ gửi khi rating được reveal (blind review)
**Bugs đã fix:**
- LocationPicker overlay bị clip trong FilterSidebar → createPortal
- Rating eligibility check fail trên production dù đã qua giờ chơi → timezone UTC vs Vietnam
- Bảng `rating_tags` thiếu trên Aiven → tạo thủ công qua MySQL Workbench kết nối Aiven
- Firestore conversations chứa tin nhắn test cũ từ local dev → xóa collection `conversations` trên Firebase console
- Rating notification lộ thông tin trước khi reveal (blind review bị vi phạm) → chuyển notification sang revealRatings
- Google login + Cloudinary avatar upload đã hoạt động từ session trước
**Blocker:** Không có
**Việc tiếp theo:** Hỏi supervisor xem production ổn chưa, sau đó làm report

---

### 2026-05-25 (session 2)

**Đang làm:** Chuẩn bị đồ án tốt nghiệp — vẽ Use Case Diagram + tìm hiểu cấu trúc report
**Đến đâu rồi:** Đã vẽ xong Use Case Diagram (PlantUML) với 1 actor User, 8 package, 26 use case. Chưa bắt đầu viết report.
**Files đã sửa:** Không có (session thiết kế tài liệu)
**Use Case Diagram đã chốt:**
- Actor: User (không có Admin)
- Package: Xác thực, Quản lý hồ sơ, Quản lý bài đăng, Tham gia trận đấu, Nhắn tin, Thông báo, Đánh giá uy tín, Chatbot AI
- Quan hệ: `<<extend>>` cho Đăng nhập Google; `<<include>>` cho Chọn địa điểm, Lọc bài đăng, Upload avatar, Quản lý môn thể thao, Đánh dấu đã đọc
**Phát hiện thêm:** Render free tier tự spin down sau 15 phút không có request → posts load mãi trên production → fix bằng UptimeRobot ping mỗi 5 phút
**Blocker:** Không có
**Việc tiếp theo:** Tiếp tục viết report đồ án tốt nghiệp (các chương còn lại sau Use Case Diagram)

---

### 2026-06-01

**Đang làm:** Tài liệu đồ án tốt nghiệp — vẽ Sequence Diagrams cho 14 use case (PlantUML)
**Đến đâu rồi:** Đã viết đủ 14 PlantUML diagrams với naming convention đúng theo mẫu (`actor Actor as actor`, `entity User as user`). Chưa kiểm tra kỹ từng diagram, chưa xong các phần khác của report.
**Files đã sửa:**
- `Project_SportLink/sequence-diagrams.drawio` — đã tạo (draw.io XML, 11 trang, từ session trước)
**Diagrams đã viết (PlantUML, chưa lưu file riêng):**
- Login, Register
- Manage Posts (Basic Flow, Update Sub Flow, Delete Sub Flow)
- View and Filter Posts
- Manage Profile (Basic Flow, gộp View + Update)
- Match Participation (Basic Flow, Accept, Reject, Rate Sub Flow)
- Receive Notification
- Messaging (Basic Flow, gộp Send)
- AI Chatbot
**Convention đã chốt:** `actor Actor as actor` (hình nhân) — theo mẫu report chị senior; `entity User as user` (không dùng UserData)
**Blocker:** Không có
**Việc tiếp theo:** Kiểm tra lại nội dung 14 diagrams cho đúng với logic thực tế của app, sau đó tiếp tục các phần còn lại của report đồ án

---

### 2026-06-04 → 2026-06-05

**Đang làm:** Báo cáo đồ án tốt nghiệp — Chapter 3 (verify use case descriptions) + Chapter 4 Methodology
**Đến đâu rồi:** Chưa xong Methodology.
- **Chapter 3 (xong):** Đã verify toàn bộ 3.4.1–3.4.8 Use Case and Scenario Description so với code thực tế. Các fix đã áp dụng: Match Participation Basic Flow bỏ bước confirm riêng (gộp vào bước 5), Messaging Basic Flow bỏ bước confirm send.
- **Chapter 4 (đang làm):** Đã xong 4.1 Tools and Techniques (IntelliJ IDEA, Spring Boot, MySQL, Firebase Firestore, JWT, Axios, ReactJS, Leaflet, DeepSeek AI, Cloudinary, Render, Vercel, Postman). Đã vẽ xong ERD các bảng. Đang làm phần trình bày và mô tả từng bảng database (4.3).
**Files đã sửa:** Không có thay đổi code (session viết báo cáo)
**Blocker:** Không có
**Việc tiếp theo:** Tiếp tục Chapter 4 Methodology — hoàn thiện 4.3 Database Design (mô tả từng bảng) + 4.2 System Architecture + 4.4 Use Cases Implementation

---

### 2026-06-08 → 2026-06-09

**Đang làm:** Báo cáo đồ án tốt nghiệp — Chapter 4 Methodology (4.3 Database Design + 4.2 System Architecture)
**Đến đâu rồi:**
- **4.3 Database Design (xong):** Đã viết mô tả đầy đủ tất cả các bảng theo pattern 3 bullet (English + Tiếng Việt): users, user_sports, sport_posts, join_requests, notifications, ratings, rating_tags, invalidated_tokens. Phát hiện thiếu bảng rating_tags trong schema.sql và bổ sung. Phát hiện thiếu cột is_revealed trong ratings và bổ sung.
- **4.2 System Architecture (chưa xong):** Đã có draft hoàn chỉnh gồm Container Diagram + Component Diagram (Mermaid) và 4 subsection (4.2.1 Frontend / 4.2.2 Backend / 4.2.3 Database / 4.2.4 Real-time). Chưa finalize vào report.
**Files đã sửa:** Không có thay đổi code (session viết báo cáo)
**Blocker:** Không có
**Việc tiếp theo:** Hoàn thiện 4.2 System Architecture + các phần còn lại của report + viết mô tả các Sequence Diagram

---

### 2026-06-15

**Đang làm:** Báo cáo đồ án tốt nghiệp — Chapter 5, Chapter 6, Bibliography
**Đến đâu rồi:** Xong toàn bộ report. Đang chờ thầy review và phản hồi chỉnh sửa.
- **Chapter 5 Result and Discussion (xong):** Viết 5.1 Result (7 mô-đun: Authentication, Manage Posts, Manage Profile, Match Participation, Real-time Messaging, Notifications, AI Chatbot) + 5.2 Discussion (5 limitation: Render free tier cold start, polling notifications, no admin UI, blind review edge cases, chatbot accuracy).
- **Chapter 6 Conclusion and Future Works (xong):** 6.1 Conclusion (intro paragraph + 7 bullet chức năng) + 6.2 Future Works (8 bullet: mobile app, push notifications, advanced search, admin dashboard, group chat, tournament, AI chatbot improvements, scalable infra).
- **Bibliography (xong):** 4 tài liệu — [1] Xia Qianqian (sports social APP thesis, University of Turku 2018), [2] Rod Johnson (Spring Framework), [3] Larry Ullman (MySQL), [4] Alex Banks (Learning React). Citation [1] đặt trong Chapter 1 Introduction.
- **Appendices:** Chưa làm — sẽ chụp màn hình các trang chính của app để đưa vào.
**Files đã sửa:** Không có thay đổi code (session viết báo cáo)
**Blocker:** Đang chờ feedback từ thầy
**Việc tiếp theo:** Đọc và hiểu chi tiết toàn bộ code dự án — từng chức năng được implement như thế nào (frontend + backend)

---

### 2026-06-16

**Đang làm:** Ôn code toàn bộ dự án để chuẩn bị bảo vệ đồ án — đi qua từng feature, giải thích frontend + backend + database
**Đến đâu rồi:**
- **Feature 1 — Authentication (xong):** Đã giải thích đầy đủ: SecurityConfig, User entity, InvalidatedToken, AuthController, AuthService (register/login/logout/refresh/Google OAuth), CustomJwtDecoder, ApplicationInitConfig, axiosConfig.js (request interceptor + 401 popup), authApi.js, AuthModal.jsx, GoogleCallbackPage.jsx
- **Feature 2–9 (chưa làm):** Posts, Filter/Search, Profile, Join Requests, Chat, Notifications, Rating, Chatbot
**Files đã sửa:** Không có thay đổi code (session ôn tập)
**Blocker:** Không có
**Việc tiếp theo:** Feature 2 — Quản lý bài đăng (Posts): tạo/sửa/xóa bài, hiển thị danh sách, auto-expire
