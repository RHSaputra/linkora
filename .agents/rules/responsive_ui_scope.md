# Strictly Scoped Responsive UI Rules

## Core Rule: Isolated Device Scope
Every UI/design change request must have a strict, isolated device scope.
The 3 target viewports are:
1. DESKTOP / LAPTOP
2. TABLET
3. HP / MOBILE

UNLESS explicitly requested by the user, DO NOT edit or touch viewports outside the requested target scope.

## Target Device Scoping Directives
- **Mobile / HP Request** (e.g., "perbaiki desain HP"):
  - **Editable**: HP / Mobile only.
  - **Protected / Locked**: Tablet, Desktop / Laptop.
  - Use scoped `@media` queries or isolated mobile-specific overrides.
- **Tablet Request** (e.g., "perbaiki desain TABLET"):
  - **Editable**: Tablet only.
  - **Protected / Locked**: HP / Mobile, Desktop / Laptop.
- **Desktop / Laptop Request** (e.g., "perbaiki desain DESKTOP"):
  - **Editable**: Desktop / Laptop only.
  - **Protected / Locked**: HP / Mobile, Tablet.

## Global Style & Shared Component Protection
- Do NOT modify global CSS, shared components, base spacing, global typography, or root layout structures if a fix is intended for a single device scope.
- If a shared component needs modification for one device, isolate the change using media queries or targeted overrides without altering the baseline for other devices.
- Never "clean up", "refactor", or "perfect" layout/styles for non-targeted devices.
- Do not alter, add, or remove existing project breakpoints unless explicitly instructed.

## Pre & Post Verification Checklist
1. **Target Identification**: Identify `TARGET DEVICE` vs `LOCKED DEVICES`.
2. **Isolation Check**: Ensure changes use media queries or scoped overrides.
3. **Regression Audit**: Verify that non-targeted viewports remain identical to baseline.
