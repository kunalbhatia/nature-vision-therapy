# 🌿 Nature Vision Therapy - Developer & Agent Reference Guide

This document is a comprehensive, quick-reference guide designed for developers and AI coding assistants working on the `nature-vision-therapy` repository. It outlines the project structure, clinical context, coding standards, technical architecture, and workflows.

---

## 🎯 1. Clinical Context & Target Audience
* **Patient Profile:** Built for a 10-year-old child diagnosed with **Amblyopia (lazy eye)** in the right eye and **high myopia** (Right: -9.00 sphere / -1.00 cylinder, Left: -8.00 sphere).
* **Equipment:** The child uses standard **Red-Cyan (Red-Blue) anaglyph glasses** at home.
* **Core Goal:** Gamify traditional, repetitive vision therapy exercises to maximize compliance.
* **Key Mechanisms:**
  * **Anti-Suppression / Binocular Fusion:** Red-Cyan filter separation (forces both eyes to work together).
  * **Oculomotor Control:** Saccades and Smooth Pursuits.
  * **Accommodative Facility:** Near-Far focusing drills.
  * **Patching Compliance:** Rewarding patching duration with AI-generated stories (Gemini 1.5 Flash), leveling, and XP.

---

## 🛠️ 2. Tech Stack Summary
* **Frontend:** React 19, TypeScript, Vite.
* **Styling:** Tailwind CSS + DaisyUI (Nature-inspired theme).
* **Forms & Validation:** React Hook Form + Zod.
* **Backend:** Node.js/TypeScript Serverless Functions in the `api/` directory.
* **Database:** MongoDB (User credentials, personalization, patching history, games/exercises scores, and achievements).
* **AI:** Google Generative AI (Gemini 1.5 Flash API) for dynamic storytelling.
* **Testing:** Cypress (E2E & Component testing).
* **Package Manager:** `pnpm`.

---

## 📂 3. Directory Layout
* `api/` — Serverless endpoints (e.g., login, signup, progress, patching sessions, achievements).
* `cypress/` — E2E and Component test files.
* `public/` — Static assets (images, icons).
* `src/` — React client code:
  * `components/` — General UI components and specialized subfolders:
    * `dashboard/` — Progress visualizations and statistics.
    * `exercises/` — Monocular focus and tracking modules (Dot Tracing, Saccades, Brock String, Near-Far).
    * `games/` — Red-Cyan anaglyph games (Anaglyph Snake, Maze, Bubble Pop, Hidden Picture).
    * `therapy/` — Compliance tools (PatchingTimer, StreakCalendar, ComplianceBadges).
  * `context/` — React Contexts (Snackbar, Preloader).
  * `hooks/` — Custom hooks (Auth state, snackbar triggers).
  * `pages/` — Top-level router pages (Home, Dashboard, Stories, Therapy, Auth).
  * `providers/` — App-wide providers.
  * `App.tsx` & `main.tsx` — Main application shell and routing.

---

## 🚦 4. Critical Coding Standards & Rules
Must be followed in all feature additions and refactoring:

### 📺 Fullscreen Requirement
All interactive game and exercise components **must** support and trigger fullscreen mode upon starting.
* **Implementation Pattern:** Use a React `useRef` to reference the game/exercise container (`containerRef`) and invoke `requestFullscreen()` when the exercise starts.
* **Why:** Minimizes UI distractions and helps the child focus entirely on the clinical task.

### ⚡ Vercel Hobby Plan Compliance
The application runs on Vercel's free hobby plan, which enforces a **strict limit of 12 serverless functions**.
* **Rule:** Do not create a separate API file for every small endpoint. Group related API endpoints into consolidated handler/dispatcher files in the `api/` folder (e.g., using query parameters or request body types to route requests).

### 🔒 Device Enforcement
Ensure clinical exercises and games are not played on small screens (mobile), as they are ineffective for high-intensity tracking/fusion exercises.
* Use the `<DeviceRestriction>` wrapper component to lock access to tablet, desktop, or laptop devices for games and exercises.

### 🧪 Strict TypeScript & Testing
* Never use `any` types. Define clear interfaces/types for API responses and component props.
* Any new exercise or game must include accompanying Cypress component/E2E tests to verify functionality.

---

## 🔄 5. Git Workflow & CI/CD
To maintain a clean and linear git history:
* **Feature Branches:** Create clean branch names (e.g. `feat/brock-string-updates` or `fix/timer-bug`).
* **Commits:** Write clear semantic messages (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
* **Merging:** Prefer **Squash and Merge** or **Rebase and Merge** inside the GitHub PR flow to avoid merge commits on the `main` branch. Run a local rebase (`git rebase main`) on your feature branch before pushing.

---

## 🧩 6. Adding a New Game or Exercise Checklist
When introducing a new game (Anaglyph) or exercise (Monocular/Oculomotor):
1. **Design Layout:** Place components inside `src/components/games/` or `src/components/exercises/`.
2. **Add Fullscreen:** Implement `containerRef` and `requestFullscreen()` triggers.
3. **Wrap in Device Restriction:** Protect the page using `DeviceRestriction.tsx`.
4. **Integrate Analytics:** Save scores/XP by making a POST request to `/api/save-game-score`.
5. **Update Routing:** Register the new game/exercise in `src/App.tsx` and list it in `src/pages/TherapyPage.tsx`.
6. **Add Tests:** Write a Cypress test under the `cypress/` directory.

---

*For full project design documentation, refer to the [blueprint.md](file:///C:/Users/Kunal/Desktop/hobby-projects/nature-vision-therapy/blueprint.md).*
