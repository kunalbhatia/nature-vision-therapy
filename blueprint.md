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

#### 5.1 Patching Compliance Tracker

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

**Data model (MongoDB):**
```typescript
PatchingSession {
  userId: string
  date: string          // YYYY-MM-DD
  durationMinutes: number
  completed: boolean
  timestamp: Date
}
```

---

#### 5.2 Red-Blue Anaglyph Games

**Why:** Child already has red-blue glasses. These games force both eyes to work together, directly treating amblyopia through binocular fusion. Clinically proven technique.

**How it works:**
- Red channel visible only to right eye (through red lens)
- Blue/cyan channel visible only to left eye (through blue lens)
- Brain must merge both to "see" the complete image
- This trains the brain to stop suppressing the weaker right eye

**Games to build:**

**Game 1: Anaglyph Bubble Pop**
- Bubbles fall from top
- Red bubbles only visible to right eye
- Blue bubbles only visible to left eye
- "Golden" bubbles require both eyes (rendered in both channels)
- Score multiplier for golden bubbles — encourages binocular fusion
- Difficulty levels: slow/medium/fast

**Game 2: Anaglyph Hidden Picture**
- Background image split across red/blue channels
- Complete picture only visible when both eyes work together
- Timer-based: "Find the hidden animal in 30 seconds"
- 10 levels of increasing difficulty

**Game 3: Anaglyph Maze**
- Maze walls in red channel (right eye)
- Player avatar in blue channel (left eye)
- Must navigate using both eyes simultaneously
- Arrow key / swipe controls

**Technical implementation:**
```typescript
// CSS filter approach for anaglyph rendering
// Red layer: filter: url(#red-channel)
// Cyan layer: filter: url(#cyan-channel)

// SVG filter definitions
<svg style="display:none">
  <defs>
    <filter id="red-channel">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cyan-channel">
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
    </filter>
  </defs>
</svg>
```

**New files:**
```
src/components/games/AnaglyphBubblePop.tsx
src/components/games/AnaglyphHiddenPicture.tsx
src/components/games/AnaglyphMaze.tsx
src/components/games/AnaglyphWrapper.tsx   # Shared anaglyph filter utility
src/hooks/useGameScore.ts
src/hooks/useAnaglyphRenderer.ts
```

---

#### 5.3 Monocular Right-Eye Exercises

**Why:** During patching sessions, the right eye (weaker eye) needs engaging exercises. These run while left eye is patched.

**Exercises:**

**Exercise 1: Dot Tracing**
- Moving dot traces patterns on screen
- Child follows with eyes only (no head movement)
- Patterns: figure-8, circle, zigzag, star
- Speed control

**Exercise 2: Near-Far Focus Drill**
- Large text appears → shrinks to tiny text → back to large
- Child reads aloud or taps when in focus
- Trains accommodation (focusing muscle)

**Exercise 3: Letter/Number Hunt**
- Grid of characters, specific ones highlighted briefly
- Child must tap/click the target
- Builds visual acuity and attention in right eye

**New files:**
```
src/components/exercises/DotTracing.tsx
src/components/exercises/NearFarFocus.tsx
src/components/exercises/CharacterHunt.tsx
src/components/exercises/ExerciseTimer.tsx
```

---

### PHASE 2 — Vision Therapy Exercises

#### 5.4 Brock String Simulation

**Why:** Brock string is a standard orthoptic exercise for convergence and binocular vision. Simulating it on screen is helpful for practice guidance.

**Status:** ✅ Done

**Features:**
- Animated virtual Brock string on screen
- Instruction overlay: "Focus on the near bead — you should see two strings crossing"
- Guided session with timer
- Visual simulation of physiological diplopia (double vision)

---

#### 5.5 Smooth Pursuit / Tracking Exercises

**Why:** Builds eye muscle control and tracking ability.

**Exercises:**
- Moving target: follow the butterfly/bird across screen
- Predictable vs unpredictable paths
- Speed levels
- Session duration: 2–5 minutes

**New files:**
```
src/components/exercises/SmoothPursuit.tsx
src/components/exercises/TargetTracker.tsx
```

---

#### 5.6 Saccade Training

**Why:** Trains rapid eye movement between targets — important for reading.

**Features:**
- Two targets appear on opposite sides of screen
- Tap/look at each alternately
- Speed increases progressively
- Measures reaction time

---

#### 5.7 Anaglyph Snake Game

**Why:** Combines eye-hand coordination with binocular fusion training in a high-engagement format.

**Features:**
- Classic Snake mechanics on a grid.
- **Dark Mode:** Solid black background to reduce eye strain.
- **Visuals:** Pure white snake body (visible to both eyes).
- **Anaglyph Therapy:** Particles (food) are randomly assigned as either **Red** (Right Eye) or **Blue/Cyan** (Left Eye).
- **Forced Switch:** Child must use both eyes to find and eat all particles as they appear.
- **Growth:** Snake increases in size with each particle consumed.
- **Game Over:** Collision with walls or self ends the session.
- **Controls:** Arrow keys or on-screen directional swipe.

**New files:**
```
src/components/games/AnaglyphSnake.tsx
```

---

### PHASE 3 — Progress & Gamification

#### 5.8 Progress Dashboard

**For the child:**
- XP points earned today
- Weekly exercise completion chart
- Unlocked achievements
- "Vision Power" level (gamified metric)

**For the parent:**
- Patching compliance calendar
- Exercise completion rate
- Time spent per exercise type
- Export report as PDF (for doctor visits)

**New files:**
```
src/components/dashboard/ChildDashboard.tsx
src/components/dashboard/ParentDashboard.tsx
src/components/dashboard/ProgressChart.tsx
src/components/dashboard/AchievementBadges.tsx
api/get-progress-summary.ts
```

**Data model:**
```typescript
UserProgress {
  userId: string
  date: string
  exercisesCompleted: ExerciseLog[]
  totalXP: number
  streak: number
  badges: string[]
}

ExerciseLog {
  type: 'patching' | 'anaglyph' | 'monocular' | 'pursuit' | 'saccade'
  durationSeconds: number
  score?: number
  completedAt: Date
}
```

---

#### 5.9 Reward / Unlock System

- Earn stars per completed session
- Stars unlock new story themes in the existing AI story generator
- Unlock new game levels
- Weekly challenge: "Complete all 5 exercises this week → unlock special story"

---

### PHASE 4 — AI Story Enhancements

#### 5.10 Therapy-Integrated Stories

- AI generates stories where the child IS the protagonist
- Stories reference the therapy: "Zara used her super vision powers to spot the hidden treasure..."
- Stories adapt difficulty based on which exercise just completed
- Post-exercise story as a reward

**API change needed:**
```typescript
// Add to story generation prompt
interface StoryContext {
  childName: string
  completedExercise: string
  difficultyLevel: number
  preferredTheme: string  // nature, space, fantasy, animals
}
```

---

#### 5.11 Read-Aloud Mode

- Text-to-speech for stories (Web Speech API)
- Useful during patching when right eye is working hard
- Font size auto-adjusts to therapy recommendation

---

## 6. Navigation / Routing Plan

```
/ (Home)
├── /login
├── /signup
├── /dashboard
│   ├── /dashboard/child        # Child view with games + exercises
│   └── /dashboard/parent       # Parent compliance + progress view
├── /therapy
│   ├── /therapy/patching       # Patching timer
│   ├── /therapy/anaglyph       # Red-blue games
│   ├── /therapy/monocular      # Right-eye exercises
│   ├── /therapy/pursuit        # Tracking exercises
│   └── /therapy/saccade        # Saccade training
├── /stories                    # Existing story generator
└── /settings                   # Personalization
```

**Install React Router:**
```bash
pnpm add react-router-dom
```

---

## 7. New API Endpoints Needed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/save-patching-session` | POST | Log a patching session |
| `/api/get-patching-history` | GET | Fetch patching calendar data |
| `/api/save-exercise-session` | POST | Log any exercise completion |
| `/api/get-progress-summary` | GET | Dashboard data |
| `/api/get-achievements` | GET | Badges earned |
| `/api/save-game-score` | POST | Save game high scores |

---

## 8. MongoDB Schema Additions

```typescript
// Add to existing MongoDB collections

// New collection: therapy_sessions
{
  _id: ObjectId,
  userId: string,
  sessionType: 'patching' | 'anaglyph_bubble' | 'anaglyph_maze' | 
               'anaglyph_hidden' | 'dot_tracing' | 'near_far' | 
               'character_hunt' | 'pursuit' | 'saccade',
  durationSeconds: number,
  score: number | null,
  completedAt: Date,
  metadata: Record<string, unknown>  // game-specific data
}

// New collection: user_achievements
{
  _id: ObjectId,
  userId: string,
  badgeId: string,
  earnedAt: Date
}

// Extend existing users collection
{
  // existing fields...
  childName: string,
  childAge: number,
  prescriptionRight: { sphere: number, cylinder: number },
  prescriptionLeft: { sphere: number },
  therapyGoals: {
    dailyPatchingMinutes: number,
    exercisesPerDay: number
  },
  role: 'child' | 'parent'
}
```

---

## 9. Component Architecture Principles

- **Every game/exercise is a standalone component** — receives `onComplete(score, duration)` callback
- **Games are time-boxed** — default 5 minutes, configurable
- **All therapy components emit events** to a central `TherapySessionContext`
- **Anaglyph components** accept a `mode: 'red-blue' | 'red-cyan'` prop (different glasses types)
- **Mobile-first** — exercises must work on tablet (child likely uses one)

```typescript
// Standard exercise component interface
interface ExerciseProps {
  durationSeconds?: number      // default: 300 (5 min)
  difficulty?: 1 | 2 | 3        // easy | medium | hard
  onComplete: (result: ExerciseResult) => void
  onExit: () => void
}

interface ExerciseResult {
  score: number
  durationSeconds: number
  accuracy?: number
  completedAt: Date
}
```

---

## 10. Environment Variables

```env
# Existing
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_google_ai_api_key

# New (add these)
NEXT_PUBLIC_APP_NAME=Nature Vision Therapy
JWT_EXPIRY=7d
```

---

## 11. Build & Run

```bash
# Install
pnpm install

# Development (frontend only)
pnpm dev

# Development (with API functions)
pnpm dev:vercel

# Lint
pnpm lint

# Build
pnpm build

# Test (Cypress)
npx cypress open
npx cypress run
```

---

## 12. Deployment

- **Platform:** Vercel
- **Trigger:** Push to `main` branch → GitHub Actions → Auto deploy
- **Config:** `vercel.json` in root
- **Env vars:** Set in Vercel dashboard (not in code)

---

## 13. Build Priority Order

For an AI agent or developer picking this up:

```
Step 1: Add React Router — set up all routes (2 hrs)
Step 2: Build PatchingTimer component — most critical for therapy (4 hrs)
Step 3: Build AnaglyphWrapper + BubblePop game (6 hrs)
Step 4: Build StreakCalendar + ComplianceBadges (3 hrs)
Step 5: Add new MongoDB collections + API endpoints (4 hrs)
Step 6: Build ChildDashboard with XP system (5 hrs)
Step 7: Build remaining monocular exercises (6 hrs)
Step 8: Build ParentDashboard with progress charts (4 hrs)
Step 9: Enhance AI story generator with therapy context (2 hrs)
Step 10: Add Read-Aloud mode (2 hrs)
```

**Total estimated effort: ~38 hours**

---

## 14. Key Clinical Context (for AI agents)

This context is important for generating appropriate content:

- **Patient:** 10-year-old girl
- **Condition:** Amblyopia (lazy eye) in right eye + high myopia both eyes
- **Treatment:** Patching left eye (forces right eye to work) + binocular exercises
- **Glasses:** Red-blue anaglyph glasses available at home
- **Urgency:** Age 10 is near the limit of amblyopia treatability (~12 years). Every month matters.
- **Story tone:** Encouraging, age-appropriate, nature-themed, short (100–200 words)
- **Exercise duration:** 5–10 minutes per session, multiple sessions per day
- **Gamification principle:** Child must WANT to open the app daily

---

## 15. Glossary

| Term | Meaning |
|------|---------|
| Amblyopia | "Lazy eye" — brain suppresses weaker eye |
| Anaglyph | Red-blue 3D technique where each eye sees different content |
| Binocular fusion | Brain combining images from both eyes into one |
| Patching | Covering the stronger eye to force the weaker eye to work |
| Saccade | Rapid eye movement between two points |
| Smooth pursuit | Smoothly tracking a moving target |
| Accommodation | Eye's ability to change focus between near and far |
| Myopia | Nearsightedness — distant objects are blurry |
| Diopter | Unit of lens power (e.g., -9.00D) |

---

*Last updated: June 2026*
*Maintained by: Kunal Bhatia*
