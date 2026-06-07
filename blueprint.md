# Nature Vision Therapy — BLUEPRINT.md

> **Purpose:** This document is the single source of truth for the `nature-vision-therapy` project.
> It describes what exists, what needs to be built, and how everything fits together.
> Any developer or AI agent reading this file should be able to understand and extend the app.

---

## 1. Project Overview

**Name:** Nature Vision Therapy
**URL:** https://nature-vision-therapy.vercel.app
**Repo:** https://github.com/kunalbhatia/nature-vision-therapy
**Owner:** Kunal Bhatia

### Why This Exists
Built specifically for a 10-year-old child diagnosed with:
- **Amblyopia (lazy eye)** in the right eye
- **High myopia** — Right eye: -9.00 sphere / -1.00 cylinder, Left eye: -8.00 sphere
- The child has **red-blue anaglyph glasses** at home
- Goal: Make vision therapy **engaging and gamified** so a child actually does it daily

### Core Philosophy
- Therapy disguised as fun
- Daily compliance is the biggest challenge — gamification solves this
- All exercises grounded in clinically valid vision therapy techniques
- Parent dashboard to track progress

---

## 2. Current Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS + DaisyUI |
| Forms | React Hook Form + Zod |
| Backend | Vercel Serverless Functions (api/ folder) |
| Database | MongoDB (user auth + character data) |
| AI | Google Generative AI (Gemini) — story generation |
| Auth | JWT + bcryptjs |
| Testing | Cypress (component + E2E) |
| Deployment | Vercel + GitHub Actions CI/CD |
| Package Manager | pnpm |

---

## 3. Current File Structure

```
nature-vision-therapy/
├── .github/workflows/        # GitHub Actions CI/CD (deploy.yml)
├── .husky/                   # Git hooks
├── api/                      # Vercel serverless functions
│   ├── get-characters-details.ts
│   ├── login.ts
│   ├── logout.ts
│   ├── me.ts
│   ├── pingMongo.ts
│   ├── save-characters.ts
│   └── signup.ts
├── cypress/                  # E2E + component tests
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── Controls.tsx          # Font size + topic controls
│   │   ├── LoginForm.tsx         # Auth
│   │   ├── SignupForm.tsx        # Auth
│   │   ├── Modal.tsx             # Reusable modal
│   │   ├── NavBar.tsx            # Navigation
│   │   ├── Personalization.tsx   # User preferences
│   │   ├── Preloader.tsx         # Loading spinner
│   │   ├── Snackbar.tsx          # Toast notifications
│   │   ├── StoryDisplay.tsx      # Renders the story
│   │   └── StoryGenerator.tsx    # AI story generation UI
│   ├── context/
│   │   ├── PreloaderContext.tsx
│   │   └── SnackbarContext.ts
│   ├── hooks/
│   │   ├── AuthStatus.ts
│   │   ├── Preloader.ts
│   │   └── Snackbar.ts
│   ├── providers/
│   │   └── SnackbarProvider.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── vercel.json
└── tsconfig.json
```

---

## 4. What Is Already Built

| Feature | Status | Notes |
|---------|--------|-------|
| User signup / login | ✅ Done | JWT + MongoDB |
| AI story generation | ✅ Done | Google Gemini API |
| Adjustable font size | ✅ Done | Accessibility control |
| Nature-themed UI | ✅ Done | Calming DaisyUI design |
| User personalization | ✅ Done | Saved preferences |
| Responsive design | ✅ Done | Mobile + desktop |
| CI/CD pipeline | ✅ Done | GitHub Actions → Vercel |
| Cypress testing | ✅ Done | Component + E2E |

---

## 5. What Needs To Be Built

### PHASE 1 — Amblyopia Treatment Core (Highest Priority)

These features directly support the child's medical treatment. Build these first.

---

#### 5.1 Patching Compliance Tracker ✅ Done

**Why:** Patching is the #1 prescribed treatment. The biggest challenge is getting a 10-year-old to do it daily. Gamification solves this.

**Features:**
- Daily patching timer (configurable: 1hr, 2hr, custom)
- Start / Pause / Stop controls
- Streak tracker with visual calendar (GitHub-style heatmap)
- Milestone badges: "7 days 🌟", "30 days 🏆", "100 days 👑"
- Push notification reminder (use browser Notification API)
- Parent can set the daily goal
- Data stored per user in MongoDB

**New files to create:**
```
src/components/therapy/PatchingTimer.tsx
src/components/therapy/StreakCalendar.tsx
src/components/therapy/ComplianceBadges.tsx
api/save-patching-session.ts
api/get-patching-history.ts
```

---

#### 5.2 Red-Blue Anaglyph Games ✅ Done

**Why:** Child already has red-blue glasses. These games force both eyes to work together, directly treating amblyopia through binocular fusion. Clinically proven technique.

**Games to build:**
1. **Anaglyph Bubble Pop**
2. **Anaglyph Hidden Picture**
3. **Anaglyph Maze**

---

#### 5.3 Monocular Right-Eye Exercises ✅ Done

**Why:** During patching sessions, the right eye (weaker eye) needs engaging exercises.

**Exercises:**
1. **Dot Tracing**
2. **Near-Far Focus Drill**
3. **Letter/Number Hunt**

---

### PHASE 2 — Vision Therapy Exercises

#### 5.4 Brock String Simulation ✅ Done
#### 5.5 Smooth Pursuit / Tracking Exercises ✅ Done
#### 5.6 Saccade Training ✅ Done
#### 5.7 Anaglyph Snake Game ✅ Done

---

### PHASE 3 — Progress & Gamification

#### 5.8 Progress Dashboard ✅ Done
#### 5.9 Reward / Unlock System ✅ Done

- XP points earned today
- Weekly exercise completion tracker ("Mastery of Variety")
- Level-based story theme unlocking
- Persistent badges in MongoDB

---

### PHASE 4 — AI Story Enhancements

#### 5.10 Therapy-Integrated Stories ✅ Done
#### 5.11 Read-Aloud Mode ✅ Done

---

## 6. Navigation / Routing Plan ✅ Done

---

## 7. API Endpoints Status

| Endpoint | Status |
|----------|--------|
| `/api/save-patching-session` | ✅ Done |
| `/api/get-patching-history` | ✅ Done |
| `/api/save-game-score` | ✅ Done |
| `/api/get-progress-summary` | ✅ Done |
| `/api/get-achievements` | ✅ Done |

---

## 8. MongoDB Schema Status ✅ Done

---

## 13. Build Priority Order - ALL STEPS COMPLETED 🏁

1. React Router ✅
2. PatchingTimer ✅
3. Anaglyph Games ✅
4. Streak/Badges ✅
5. API/DB ✅
6. Dashboards ✅
7. Monocular Exercises ✅
8. Parent Dashboard ✅
9. AI Story Context ✅
10. Read-Aloud Mode ✅

---

*Last updated: June 2026*
*Maintained by: Kunal Bhatia*
