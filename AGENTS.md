# AI Coding Agent Guidelines & Rules

## Responsive UI Device Scoping Directive

Every UI/design change request MUST follow a strict device scope.

### Target Viewport Categories:
1. **DESKTOP / LAPTOP**
2. **TABLET**
3. **HP / MOBILE**

### Strict Execution Rules:
1. **Target Isolation**:
   - `HP / MOBILE` request -> Only HP/Mobile is **EDITABLE**. Tablet & Desktop are **LOCKED / PROTECTED**.
   - `TABLET` request -> Only Tablet is **EDITABLE**. HP/Mobile & Desktop are **LOCKED / PROTECTED**.
   - `DESKTOP / LAPTOP` request -> Only Desktop/Laptop is **EDITABLE**. HP/Mobile & Tablet are **LOCKED / PROTECTED**.

2. **No Unrequested Global Modifications**:
   - Do NOT edit base CSS, shared component styles, global spacing/padding, global typography, or root layout structure when addressing single-device issues.
   - Always use targeted `@media` overrides or existing breakpoint utilities to isolate changes.

3. **Shared Components Protection**:
   - If a component is shared across viewports, changes MUST be scoped via media queries or device-specific class overrides without altering baseline properties for other viewports.

4. **Zero Refactoring of Non-Targeted Code**:
   - Do NOT "clean up", "touch", or "perfect" viewports that were not explicitly mentioned by the user.
   - Do NOT alter project breakpoints, breakpoint ranges, or responsive frameworks.

5. **Default Behavior (No Device Specified)**:
   - Preserve existing responsive behavior. Perform minimal, strictly scoped edits without global redesigns.
