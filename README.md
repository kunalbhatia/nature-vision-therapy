# 🌿 Nature Theme Vision Therapy

### A Clinical & Technical Platform for Interactive Vision Training

Nature Theme Vision Therapy is a specialized, web-based platform designed to enhance pediatric vision therapy through **interactive storytelling** and **clinically-validated exercises**. By merging Google's Generative AI (Gemini) with traditional vision therapy protocols, the application transforms repetitive exercises into engaging missions, solving the "compliance hurdle" common in pediatric treatment.

---

## 👨‍⚕️ Clinical Overview (For Eye Doctors)

This platform is designed to support the treatment of binocular vision disorders, amblyopia, and oculomotor dysfunction. It serves as a digital bridge between clinical office visits and home-based training.

### 🎯 Therapeutic Objectives
- **Anti-Suppression Training:** Using Red-Cyan anaglyph technology to force the brain to process input from both eyes simultaneously.
- **Binocular Fusion:** Training the eyes to work together through virtualized versions of the Brock String and other vergence tools.
- **Oculomotor Control:** Improving the speed and accuracy of Saccades (jumping focus) and Smooth Pursuits (tracking objects).
- **Accommodative Facility:** Training the eye's ability to switch focus between near and far targets.
- **Patching Compliance:** Incentivizing patching sessions with high-quality AI-generated nature stories and a rewarding XP/Leveling system.

### 👁️ The Vision Therapy Suite

#### 3D Anaglyph Training (Requires Red-Blue Glasses)
- **Virtual Brock String:** A digital simulation of the gold-standard tool for physiological diplopia training. Helps patients identify and fix suppression by visualizing the "V" pattern of strings and beads.
- **Anaglyph Snake & Maze:** Games where elements are split across color channels. If the patient suppresses one eye, they will lose sight of either the walls or the player character, forcing active binocular participation.
- **Hidden Picture:** Enhances figure-ground perception while maintaining binocular engagement.

#### Oculomotor & Tracking
- **Saccade Training:** Improves the ability to move the eyes quickly and accurately between two fixed points.
- **Smooth Pursuit:** Enhances the ability to track a moving object across a complex background.
- **Dot Tracing & Character Hunt:** Combines tracking with cognitive recognition to build visual-motor integration.
- **Near-Far Focus:** Promotes flexibility in the eye's focusing muscles (ciliary muscles) by alternating between close and distant visual tasks.

### 📊 Monitoring Progress
- **Child Dashboard:** Gamifies therapy. Children earn XP, level up their "Vision Powers," and unlock achievement badges in a "Trophy Gallery."
- **Parent Dashboard:** Provides clinical data. Parents can track patching minutes, exercise completion history, and view visual "Patching Trends" via automated charts to ensure compliance with the prescribed plan.

---

## 🛠️ Technical Documentation (For Developers)

### Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, DaisyUI.
- **Backend:** Serverless Vercel Functions (Node.js/TypeScript).
- **Database:** MongoDB (User accounts & session history).
- **AI Integration:** Google Generative AI (Gemini 1.5/2.0) for dynamic story generation.
- **UI/UX:** Nature-inspired palette, fully responsive, and accessible controls.

### 🚀 Getting Started

#### Prerequisites
- **Node.js** (v18+)
- **pnpm** (preferred)
- **MongoDB** instance
- **Google AI API Key**

#### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/kunalbhatia/nature-vision-therapy.git
   cd nature-vision-therapy
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   GOOGLE_AI_API_KEY=your_api_key
   ```

#### Scripts
- `pnpm dev`: Start local development server.
- `pnpm dev:vercel`: Run locally with Vercel serverless environment.
- `pnpm build`: Compile and type-check for production.
- `pnpm lint`: Run ESLint and check for coding standard violations.
- `pnpm test`: Execute Cypress component and E2E tests.

### 🏗️ Architecture Summary

#### Directory Structure
- `api/`: Serverless endpoints. Consolidated `auth.ts` handles all identity logic to stay within Vercel's hobby limits.
- `src/components/exercises/`: Core vision training modules.
- `src/components/games/`: Binocular anaglyph games.
- `src/components/therapy/`: Compliance tools (Timer, Badges, Streak Calendar).
- `src/hooks/`: Custom logic for Auth, Snackbar, and Anaglyph rendering.

---

## 🚦 Coding Guidelines & Standards

To maintain the clinical integrity and technical performance of the application, all contributors must adhere to the following:

### 1. Activity Fullscreen Mandate
All game and exercise components **must** implement a fullscreen mode upon starting. Use a `containerRef` and the `requestFullscreen()` API to ensure an immersive experience free of browser distractions.

### 2. Vercel Hobby Plan Compliance
The application is optimized for Vercel's free tier.
- **Consolidate APIs:** Do not create a separate file for every small function. Group related logic (like authentication) into single dispatcher files in the `api/` folder.
- **Serverless Limits:** Stay under the 12-function limit.

### 3. Git Workflow
- **Squash and Merge:** All pull requests should be "Squash and merged" to keep the main history linear and clean.
- **Descriptive Commits:** Use prefix-based commit messages (e.g., `feat:`, `fix:`, `chore:`, `docs:`).

### 4. Code Quality & Performance
- **TypeScript Strictness:** Never use `any`. Define interfaces for all API responses and component props.
- **Surgical Edits:** Avoid large refactors unless necessary. Focus on the task at hand to keep PRs reviewable.
- **Testing:** New features must include either a Cypress component test or an E2E test. Empirical verification is required for all bug fixes.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
