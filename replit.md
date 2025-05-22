# Snake Game - Architecture Guide

## Overview

This is a modern web-based Snake game built with React, Three.js, and Express. The application follows a client-server architecture where the frontend is built with React and Three.js for 3D rendering capabilities, while the backend uses Express for serving the application and handling API requests. The project uses Drizzle ORM for database interactions, though the database implementation is not yet complete.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack JavaScript architecture:

1. **Frontend**: React application with Three.js for game rendering
   - Uses React for UI components and game state management
   - Leverages Three.js (via @react-three/fiber) for potential 3D rendering features
   - Implements a custom state management approach using Zustand stores

2. **Backend**: Express.js server
   - Serves the frontend assets in production
   - Provides API endpoints for game data (though not fully implemented yet)
   - Uses a storage interface pattern that can be swapped between implementations

3. **Database**: PostgreSQL (planned)
   - Using Drizzle ORM for database schema definition and interactions
   - Currently using an in-memory storage implementation with plans to use PostgreSQL

4. **Build System**:
   - Vite for frontend bundling and development server
   - TypeScript for type safety across both frontend and backend
   - ESBuild for server-side code bundling

## Key Components

### Frontend

1. **Game Logic**
   - `useSnakeGame`: A Zustand store managing the core game state (snake position, food, score, game phase)
   - `useGame`: A simpler store managing overall game phase (ready, playing, ended)
   - `useAudio`: Store for managing game audio with mute functionality

2. **Rendering System**
   - `GameCanvas`: Renders the game using a canvas element
   - `SnakeGame`: Main game component orchestrating the game UI and logic
   - Support for Three.js (via dependencies) suggesting planned 3D features

3. **UI Components**
   - Comprehensive UI component library based on Radix UI primitives
   - Styled with Tailwind CSS
   - Responsive design with mobile controls

### Backend

1. **Server Structure**
   - Express application with structured middleware setup
   - Route registration system
   - Request logging for API endpoints

2. **Storage Interface**
   - Abstract storage interface that can be implemented in different ways
   - Current implementation is an in-memory storage system
   - Planned PostgreSQL implementation using Drizzle ORM

3. **Data Schema**
   - Defined using Drizzle ORM in `shared/schema.ts`
   - Currently has a basic user schema with username and password
   - Zod schemas for type validation

## Data Flow

1. **Game State Flow**
   - User inputs (keyboard, touch) → Game state update → Render update
   - Game events trigger audio feedback when unmuted
   - Game progression follows: ready → playing → ended → ready cycle

2. **Server Data Flow**
   - Client requests → Express router → Storage layer → Response
   - API endpoints use a prefix of `/api` for all server routes

3. **Data Persistence**
   - Currently using in-memory storage for demonstration
   - Schema defined for PostgreSQL with Drizzle ORM
   - Connection details expected via environment variables

## External Dependencies

1. **UI Framework**
   - Radix UI provides accessible primitives for UI components
   - Tailwind CSS for styling
   - shadcn/ui-style component patterns

2. **Game Rendering**
   - Canvas-based rendering for the 2D snake game
   - Three.js libraries (@react-three/fiber, @react-three/drei) for potential 3D features
   - PostProcessing support for visual effects

3. **State Management**
   - Zustand for client-side state management
   - React Query for potential API data fetching

4. **Database**
   - Drizzle ORM for database schema and queries
   - PostgreSQL as the planned database (via neon serverless)

## Deployment Strategy

The application is configured for deployment on Replit:

1. **Development Mode**
   - `npm run dev` starts both server and client
   - Vite handles HMR and development experience
   - Server runs in development mode with hot reloading

2. **Production Build**
   - Vite builds the frontend assets
   - ESBuild bundles the server code
   - Assets are served from the `dist/public` directory

3. **Configuration**
   - Environment variables for database connection
   - Replit-specific configuration in `.replit` file
   - Port configuration for Cloud Run deployment

4. **Database Requirements**
   - Requires a PostgreSQL database with connection string in DATABASE_URL
   - Schema migrations with Drizzle Kit

## Potential Improvements

1. Complete the database integration with PostgreSQL
2. Implement user authentication and score tracking
3. Add multiplayer capabilities
4. Enhance the 3D visual aspects using the Three.js capabilities
5. Add more game modes or difficulty levels