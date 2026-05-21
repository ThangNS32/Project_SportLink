---
description: Ghi lại một quyết định code/architecture vào decision log
---

Tao vừa quyết định: $ARGUMENTS

Hỏi tao lần lượt:
1. Module nào bị ảnh hưởng? (frontend / backend / shared)
2. File cụ thể nào?
3. Lý do thay đổi là gì? (đây là phần quan trọng nhất)
4. Đã xem xét alternatives nào, tại sao không chọn?

Sau khi có đủ thông tin, ghi vào `.claude/memory/decisions.md` theo format:

```
---

**Date:** [ngày hôm nay]
**Module:** [module]
**File:** [file path]
**Decision:** [mô tả quyết định]
**Reason:** [lý do — phần quan trọng nhất]
**Rejected alternatives:** [alternatives đã xem xét và lý do không chọn]

---
```

Thêm vào cuối phần Entries, không xóa entries cũ.
