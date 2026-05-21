# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SportLink** — a Vietnamese social app for finding sports partners and teams. Users post and discover sports sessions (bóng đá, cầu lông, pickleball), filter by skill level, location, and play format, and join/manage games.

## Monorepo Structure

```
backend/    Spring Boot 3.5.7 + Java 25 — REST API at http://localhost:8080/sportlink
frontend/   React 19 + Vite 8 (JSX, no TypeScript) — dev server at http://localhost:5173
```

Each subdirectory has its own `CLAUDE.md` with detailed architecture and conventions. Read those before touching code in that directory.

## Running the Stack

```bash
# Backend (from backend/)
./mvnw spring-boot:run

# Frontend (from frontend/)
npm run dev
```

Both servers must be running for the app to work. Run them in separate terminals.

## Full-Stack Data Flow

```
React (JSX) → axios (with JWT) → Spring Boot → MySQL 8
```

- All API responses: `{ code, message, result }` — always use `response.data.result`
- JWT stored in `localStorage` as `token`; axios interceptor attaches it automatically
- On 401: axios clears localStorage and redirects to `/` after 3s countdown

## Planned Features (not yet built)

Tables are defined in DB schema but endpoints don't exist yet:
- `join_requests` — join/accept/decline flow for posts
- `chat_groups`, `group_members`, `messages` — in-app messaging
- `notifications` — push/in-app notifications
- `ratings` — post-game trust score reviews (auto-ban triggers at trustScore ≤ 2)

## Chat Feature Design

### Flow tổng thể
1. Người dùng ấn **"Tham gia"** trên bài đăng → gọi `POST /api/join-requests`
   - Spring Boot tạo record `join_requests` trong MySQL, trả về `requestId`
   - Spring Boot tạo `notification` trong MySQL cho post owner
   - Frontend tạo conversation document trong Firestore với id = `req_{requestId}`
   - Frontend ghi tin nhắn đầu tiên vào Firestore subcollection `messages`:
     - Bài `find_team` → `"Tôi muốn tham gia"`
     - Bài `find_rival` → `"Tôi muốn giao hữu"`
   - Frontend navigate đến `/chat/req_{requestId}`
2. Người đăng bài nhận **thông báo** (poll `GET /api/notifications` mỗi 10 giây): `"{tên} muốn tham gia/giao hữu {tên bài}"`
3. Hai người **chat tự do** — Firestore `onSnapshot` stream real-time, không qua Spring Boot
4. Đầu chat (chỉ hiện với post owner, khi `status=pending`):
   - **"Chấp nhận lời tham gia/thách đấu từ {tên} cho bài {tên bài}"**
   - **"Từ chối lời tham gia/thách đấu từ {tên} cho bài {tên bài}"**
5. Ấn **Chấp nhận** → `PATCH /api/join-requests/{id}/accept` → Spring Boot tăng `slotsFilled` +1, cập nhật `status=accepted` → Frontend cập nhật Firestore `status=accepted`
6. Ấn **Từ chối** → `PATCH /api/join-requests/{id}/reject` → Spring Boot cập nhật `status=rejected` → Frontend cập nhật Firestore `status=rejected`

### Kiến trúc công nghệ (đã chốt)
- **Firebase Firestore**: lưu conversations + messages (real-time via `onSnapshot`)
- **Spring Boot + MySQL**: quản lý `join_requests`, `notifications`, slot update
- **Notifications**: polling `GET /api/notifications` mỗi 10s từ Header
- MySQL `chat_groups`, `messages`, `group_members` tables: **bỏ qua** — Firebase thay thế hoàn toàn

### Firestore structure
```
conversations/{req_{requestId}}/
  requestId, postId, postTitle, postType
  requesterId, requesterName, requesterAvatar
  ownerId, ownerName, ownerAvatar
  status: "pending" | "accepted" | "rejected"
  createdAt: Timestamp

conversations/{req_{requestId}}/messages/{autoId}/
  senderId, senderName, senderAvatar, content, createdAt
```

### Backend files cần tạo
- `entity/JoinRequest.java`, `entity/Notification.java`
- `entity/RequestStatus.java` (enum: pending, accepted, rejected)
- `entity/RequestType.java` (enum: join, challenge)
- `entity/NotificationType.java` (enum)
- `repository/JoinRequestRepository.java`, `repository/NotificationRepository.java`
- `dto/request/CreateJoinRequestRequest.java`
- `dto/response/JoinRequestResponse.java`, `ConversationResponse.java`, `NotificationResponse.java`
- `service/JoinRequestService.java`, `service/NotificationService.java`
- `controller/JoinRequestController.java`, `controller/NotificationController.java`

### Frontend files cần tạo
- `src/firebase.js` — Firebase init + Firestore export
- `src/api/joinRequestApi.js`, `src/api/notificationApi.js`
- `src/pages/ChatPage.jsx` — layout 2 cột
- `src/components/chat/ConversationList.jsx` — danh sách cuộc trò chuyện
- `src/components/chat/ChatWindow.jsx` — chat UI + nút accept/reject
- `src/styles/chat.css`
- Update `App.jsx` (thêm route `/chat`, `/chat/:conversationId`)
- Update `PostCard.jsx` (nút "Tham gia")
- Update `Header.jsx` (notification badge)

## Key Cross-Cutting Rules

- **Enum values** must be **lowercase** end-to-end: `bong_da`, `beginner`, `find_team`, `don_nam`, etc. Spring fails deserialization with uppercase.
- **Localization**: error messages and UI text are in Vietnamese.
- **Default admin**: `admin@sportlink.com` / `admin123` — seeded by `ApplicationInitConfig` on first run.