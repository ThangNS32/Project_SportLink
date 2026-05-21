---
name: Database Schema Location
description: Schema SQL đầy đủ của SportLink nằm ở đâu trong project
type: reference
---

Schema SQL đầy đủ lưu tại: `Project_SportLink/schema.sql` (root của monorepo, ngang với backend/ và frontend/).

## 10 bảng trong schema:
1. `users` — tài khoản, trust_score, ban_until
2. `user_sports` — môn yêu thích + skill_level của mỗi user
3. `sport_posts` — bài đăng tìm đội/đối thủ, slots_total/slots_filled, status
4. `join_requests` — yêu cầu tham gia, request_type (join/challenge), status (pending/accepted/rejected)
5. `chat_groups` — nhóm chat gắn với post_id, group_type (team/rival)
6. `group_members` — thành viên nhóm chat, role (admin/member)
7. `messages` — tin nhắn trong nhóm, msg_type (text/image)
8. `notifications` — thông báo in-app, type (join_request/accepted/rejected/group_full/challenged/banned)
9. `ratings` — đánh giá sau trận, 1–5 sao, gắn với request_id
10. `invalidated_tokens` — JWT blacklist khi logout

## Enum values quan trọng (đều lowercase):
- sport_type: `bong_da`, `cau_long`, `pickleball`
- post_type: `find_team`, `find_rival`
- skill_level: `beginner`, `intermediate`, `advanced`
- play_format: `don_nam`, `don_nu`, `doi_nam`, `doi_nu`
- request_type: `join`, `challenge`
- status (join_requests): `pending`, `accepted`, `rejected`
- status (sport_posts): `open`, `full`, `expired`, `matched`
