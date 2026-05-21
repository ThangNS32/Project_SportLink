# Bugs Solved — đừng hỏi lại

## Format

**Bug:** [mô tả lỗi]
**Symptom:** [error message / behavior]
**Root cause:** [nguyên nhân]
**Fix:** [cách fix]
**File:** [file liên quan]

---

## Entries

---

**Bug:** Leaflet default icon không hiện trên Vite
**Symptom:** Map marker biến mất, icon URL bị undefined
**Root cause:** Vite strip asset URLs khỏi Leaflet default icon khi bundle
**Fix:** Override icon ở module level trong LocationPicker.jsx bằng cách import icon PNG trực tiếp và set `L.Icon.Default.mergeOptions()`
**File:** src/components/common/LocationPicker.jsx

---

**Bug:** Avatar Google không load khi dùng cùng logic với avatar local
**Symptom:** Broken image với Google avatar URL
**Root cause:** Code prepend `http://localhost:8080/sportlink` vào cả Google URL (đã là https://)
**Fix:** `getAvatarSrc()` helper — nếu `url.startsWith("http")` return nguyên, ngược lại prepend backend base URL
**File:** src/components/common/Header.jsx, ProfilePage.jsx

---
