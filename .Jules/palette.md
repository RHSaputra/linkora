## 2026-09-13 - Added missing aria labels to buttons
**Learning:** Certain modal flows lack explicit accessible labels, leaving screen reader users confused about interactive elements like close buttons or dynamic notifications.
**Action:** Always verify icon-only interactive elements contain explicit string fallback descriptions via `aria-label` to ensure keyboard and voice access to the application.
