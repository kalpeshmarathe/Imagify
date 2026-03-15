# Realtime Chat Fix Plan

**Issues:**
- Messages disappear (optimistic updates timeout before sync)
- Chats not scoped to image (mix across images)

**Files to edit:**
- src/app/inbox/page.tsx (core logic)
- firestore.indexes.json (add imageId index if needed)

**Detailed Plan:**
1. Remove setTimeout opt cleanup - let Firestore replace naturally
2. Group chats by `imageId` primary, then threadId
3. Add limit(50) to chat listener
4. Ensure reply sets same imageId/threadId

**Steps:**
- [x] Update TODO with plan approval
- [ ] Edit inbox/page.tsx
- [ ] Test/deploy

Approve?
