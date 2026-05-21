---
description: Cập nhật session log — ghi lại đang làm gì, đến đâu rồi
---

Đọc các files sau để biết context:

```bash
cat .claude/memory/today-changes.tmp 2>/dev/null || echo "(chưa có changes hôm nay)"
git diff --name-only 2>/dev/null
git log --oneline -5 2>/dev/null
```

Sau đó hỏi tao 3 câu:
1. Hôm nay mày đang làm feature/bug gì?
2. Đã xong phần nào, còn lại phần nào?
3. Session sau làm gì tiếp?

Ghi vào `.claude/memory/session-log.md` theo đúng format template (thêm entry mới ở cuối phần Log, không xóa entries cũ).

Sau khi ghi xong, xóa `.claude/memory/today-changes.tmp` nếu tồn tại.
