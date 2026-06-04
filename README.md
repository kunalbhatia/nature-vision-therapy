# Nature Theme Vision Therapy

A comprehensive React + TypeScript + Vite application for vision therapy through interactive storytelling. Features AI-powered story generation, user authentication, personalization, and accessibility controls designed specifically for vision therapy sessions.

## ✨ Features

- 🤖 **AI Story Generation** - Dynamic story creation using Google's Generative AI, integrated with therapy progress and Text-to-Speech (Read Aloud).
- 👁️ **Vision Therapy Suite** - Clinically-focused exercises:
  - **3D Anaglyph Training:** **Virtual Brock String**, Snake, and Bubble Pop for binocular fusion and physiological diplopia training.
  - **Monocular & Tracking:** Dot Tracing, Near-Far Focus, Character Hunt, Saccade Training, and Smooth Pursuit.
- ⏱️ **Patching Compliance** - Integrated timer, streak tracking, and milestone badges.
- 📊 **Progress Dashboards** - Dedicated views for Child (XP/Levels) and Parent (Compliance/History).
- 👤 **User Authentication** - Secure login/signup with JWT and MongoDB (Consolidated API).
- 🎨 **Personalization** - Customizable user preferences and settings.
- 📖 **Adjustable Reading Experience** - Font size controls and nature-inspired UI.
- 📱 **Responsive & Immersive** - Fullscreen support for all activities on mobile and desktop.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** (preferred) or npm/yarn
- **MongoDB** database (for user authentication)
- **Google Generative AI API key** (for story generation)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nature-theme-vision-therapy
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file with your configuration:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

## 📋 Available Scripts

All scripts are defined in `package.json` and can be run with `pnpm <script-name>`:

### Development Scripts

- **`pnpm dev`** - Start development server with hot reload
- **`pnpm dev:vercel`** - Start development server with Vercel functions (routes to `/api`)

### Build Scripts

- **`pnpm build`** - Build for production (includes type checking)
- **`pnpm preview`** - Preview production build locally

### Code Quality Scripts

- **`pnpm lint`** - Run ESLint on all files

## 🏗️ Project Architecture

### Frontend Structure

```bash
src/
├── components/
│   ├── dashboard/       # Child & Parent progress views
│   ├── exercises/       # Vision training (Brock String, Pursuit, Saccades, Focus, etc.)
│   ├── games/           # Anaglyph Red-Blue games (Snake, Bubble Pop)
│   ├── therapy/         # Patching timer, Streaks, Badges
│   ├── Controls.tsx     # Font & Topic controls
│   ├── NavBar.tsx       # Navigation
│   ├── StoryDisplay.tsx # Story rendering with TTS
│   └── StoryGenerator.tsx # AI story generation with therapy context
├── context/             # React context (Snackbar, Preloader)
├── hooks/               # Custom hooks (Auth, UI state)
├── pages/               # Page-level components
├── App.tsx             # Main router
└── main.tsx            # Entry point
```

### Backend API Structure

```bash
api/
├── auth.ts              # Consolidated Auth (Login, Signup, Logout, Me)
├── get-progress-summary.ts # Dashboard data aggregation
├── save-game-score.ts    # Exercise & Game results
├── save-patching-session.ts # Patching timer persistence
├── get-patching-history.ts  # Calendar data
└── update-snake-level.ts    # Game progress persistence
```

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, DaisyUI.
- **Backend:** Vercel Functions (Serverless), MongoDB, JWT, bcryptjs.
- **AI:** Google Generative AI (Gemini).
- **Testing:** Cypress (E2E and Component).


### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linter
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚦 Development Workflow

1. **Start Development**

   ```bash
   pnpm dev
   ```

2. **Run with API Functions**

   ```bash
   pnpm dev:vercel
   ```

3. **Lint Code**

   ```bash
   pnpm lint
   ```

4. **Build for Production**

   ```bash
   pnpm build
   ```

5. **Preview Build**

   ```bash
   pnpm preview
   ```

## 🌐 Deployment

The application is configured for deployment on Vercel:

- **GitHub Actions** - Automated deployment pipeline (`.github/workflows/deploy.yml`)
- **Vercel Config** - Project configuration (`vercel.json`)
- **Environment Variables** - Set in Vercel dashboard

## 🧪 Testing

This project uses Cypress for comprehensive component and end-to-end testing. To learn about setting up and writing test cases, refer to our detailed testing guide:

**[📋 Cypress Testing Setup Guide](./cypress_setup_guide.md)**

The testing guide covers:

- Component testing configuration
- End-to-end testing setup
- Writing effective test specs
- Best practices and common patterns

### Quick Test Commands

```bash
# Open Cypress test runner
npx cypress open

# Run tests headlessly
npx cypress run

# Run only component tests
npx cypress run --component

# Run only E2E tests
npx cypress run --e2e
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
