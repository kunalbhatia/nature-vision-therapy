# Nature Theme Vision Therapy

A comprehensive React + TypeScript + Vite application for vision therapy through interactive storytelling. Features AI-powered story generation, user authentication, personalization, and accessibility controls designed specifically for vision therapy sessions.

## ✨ Features

- 🤖 **AI Story Generation** - Dynamic story creation using Google's Generative AI
- 👤 **User Authentication** - Secure login/signup with JWT and MongoDB
- 🎨 **Personalization** - Customizable user preferences and settings
- 📖 **Adjustable Reading Experience** - Font size controls for accessibility
- 🌲 **Nature-Inspired UI** - Calming design using Tailwind CSS and DaisyUI
- 📱 **Responsive Design** - Works seamlessly across all devices
- ⚡ **Fast & Modern** - Built with Vite for optimal performance

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
  - Runs Vite development server on `http://localhost:5173`
  - Includes hot module replacement (HMR)

- **`pnpm dev:vercel`** - Start development server with Vercel functions
  - Runs `vercel dev` for local development with serverless functions
  - Useful for testing API routes locally

### Build Scripts

- **`pnpm build`** - Build for production
  - Runs TypeScript compiler (`tsc -b`) followed by Vite build
  - Outputs optimized assets to `dist/` directory
  - Includes type checking and bundling

- **`pnpm preview`** - Preview production build locally
  - Serves the built application from `dist/`
  - Useful for testing production build before deployment

### Code Quality Scripts

- **`pnpm lint`** - Run ESLint on all files
  - Uses ESLint v9 with TypeScript support
  - Includes React hooks and React refresh plugins
  - Enforces code quality and consistency

## 🏗️ Project Architecture

### Frontend Structure

```bash
src/
├── components/          # React components
│   ├── Controls.tsx     # Font size and topic controls
│   ├── LoginForm.tsx    # User authentication forms
│   ├── SignupForm.tsx   # User registration
│   ├── Modal.tsx        # Reusable modal component
│   ├── NavBar.tsx       # Navigation header
│   ├── Personalization.tsx # User settings
│   ├── Preloader.tsx    # Loading indicator
│   ├── Snackbar.tsx     # Toast notifications
│   ├── StoryDisplay.tsx # Story rendering component
│   └── StoryGenerator.tsx # AI story generation
├── context/             # React context providers
│   ├── PreloaderContext.tsx
│   └── SnackbarContext.ts
├── hooks/               # Custom React hooks
│   ├── AuthStatus.ts    # Authentication state
│   ├── Preloader.ts     # Loading state management
│   └── Snackbar.ts      # Notification system
├── providers/           # Context providers
│   └── SnackbarProvider.tsx
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### Backend API Structure

```bash
api/
├── get-characters-details.ts # Character data retrieval
├── login.ts                  # User authentication
├── logout.ts                 # Session termination
├── me.ts                     # User profile data
├── pingMongo.ts             # Database health check
├── save-characters.ts        # Character data persistence
└── signup.ts                # User registration
```

## 🛠️ Technology Stack

### Frontend

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **React Hook Form** - Performant form handling
- **React Icons** - Icon library
- **Zod** - Schema validation

### Backend & Services

- **Vercel Functions** - Serverless API endpoints
- **MongoDB** - Document database
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **Google Generative AI** - Story generation

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
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

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
