---
description: Giải thích tại sao code được viết theo cách hiện tại — đọc decision log
---

Tao hỏi về: $ARGUMENTS

Thực hiện theo thứ tự:
1. Đọc `.claude/memory/decisions.md` — tìm entry liên quan đến module/file được hỏi
2. Đọc `.claude/memory/patterns.md` — tìm pattern liên quan
3. Chạy `git log --oneline --follow -p -- [file liên quan] 2>/dev/null | head -50` để thấy lịch sử thay đổi
4. Trả lời: quyết định này được chốt khi nào, lý do là gì, đã thử alternatives nào

Nếu không tìm thấy trong decision log → nói thẳng "chưa có record, đây có thể là default behavior hoặc chưa được document".
