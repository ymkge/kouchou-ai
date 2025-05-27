# 広聴AI (Kouchou-AI) - Broadlistening System

## Overview
広聴AI (Kouchou-AI) is a comprehensive broadlistening system developed for the Digital Democracy 2030 project. This application uses AI to analyze public comments and opinions, organizing them into meaningful clusters for better understanding of public sentiment. It's based on the "Talk to the City" project by AI Objectives Institute, adapted for Japanese government and municipal use cases.

## Architecture

### Core Services
1. **API (Server)** - Port 8000
   - FastAPI-based Python backend
   - Handles report generation and data management
   - Located in `/server/`

2. **Client** - Port 3000
   - Next.js frontend for report viewing
   - Interactive data visualization
   - Located in `/client/`

3. **Client-Admin** - Port 4000
   - Next.js admin interface for report creation
   - Pipeline configuration management
   - Located in `/client-admin/`

4. **Ollama (Optional)** - Port 11434
   - Local LLM support for GPU-enabled environments
   - Uses ELYZA-JP model by default

## Key Features
- CSV upload functionality for non-developers
- Dense cluster extraction
- Public comment analysis capabilities
- Multi-layer hierarchical clustering
- Interactive data visualization with charts
- Static file export for hosting
- Local LLM support with Ollama
- Google Analytics integration

## Development Environment

### Prerequisites
- Docker and Docker Compose
- OpenAI API key (or local LLM setup)
- Node.js (for frontend development)
- Python 3.x (for backend development)

### Quick Start
```bash
# Copy environment configuration
cp .env.example .env

# Start all services
docker compose up

# Access applications
# - Main app: http://localhost:3000
# - Admin panel: http://localhost:4000
# - API: http://localhost:8000
```

### Development Commands
```bash
# Lint and format code
npm run lint
npm run format

# Client development environment
make client-setup
make client-dev -j 3

# Static build generation
make client-build-static
```

### Testing
- E2E tests: `/test/e2e/` (Playwright)
- Unit tests: Various `__tests__/` directories
- Server tests: `/server/tests/`

## Technologies Used

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: OpenAI GPT models, local LLM support
- **Data Processing**: Pandas, NumPy
- **Clustering**: Hierarchical clustering algorithms
- **Testing**: pytest

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Custom component library
- **Charts**: Plotly.js for data visualization
- **Testing**: Jest, Playwright for E2E
- **Styling**: CSS modules

### DevOps
- **Containerization**: Docker & Docker Compose
- **Code Quality**: Biome for linting/formatting
- **Git Hooks**: Lefthook
- **CI/CD**: GitHub Actions

## File Structure Highlights
- `/server/broadlistening/pipeline/` - Core AI processing pipeline
- `/client/components/charts/` - Data visualization components
- `/client-admin/app/create/` - Report creation interface
- `/server/routers/` - API endpoints
- `/test/e2e/` - End-to-end test suites
- `/docs/` - Setup and configuration guides

## Configuration
Key environment variables (see `.env.example`):
- `OPENAI_API_KEY` - OpenAI API access
- `NEXT_PUBLIC_API_BASEPATH` - API base URL
- `WITH_GPU` - Enable GPU support for local LLM
- Google Analytics measurement IDs for tracking

## Deployment Options
1. **Local Development**: Docker Compose
2. **Azure Cloud**: See `Azure.md` for setup guide
3. **Static Export**: Generate static files for web hosting
4. **GitHub Pages**: Static hosting guide available

## Important Notes
- The system is in early development stage
- LLM outputs may contain biases and should be verified
- Breaking changes may occur between versions
- Backup important data before updates
- Requires significant GPU memory (8GB+) for local LLM usage

## Coding Style & Conventions

### Frontend (TypeScript/React)

#### Code Quality Tools
- **Biome**: Linting and formatting for all JavaScript/TypeScript files
  - 2-space indentation
  - 120 character line width
  - Organized imports enabled
  - Recommended rules enabled

#### TypeScript Configuration
- **Target**: ESNext with modern JavaScript features
- **Strict mode**: Enabled for type safety
- **Path mapping**: `@/*` for absolute imports
- **JSX**: Preserve mode for Next.js

#### React Patterns
- **Component Structure**: Function components with TypeScript
- **Props**: Inline type definitions for simple components, interfaces for complex ones
- **State Management**: Custom hooks for complex logic, useState for simple state
- **Imports**: Absolute imports using `@/` path mapping

#### UI Framework & Styling
- **Framework**: Chakra UI for consistent design system
- **Layout**: HStack, VStack, Box components for layout
- **Responsive**: Breakpoint objects for responsive design
- **Validation**: Visual feedback with border colors and error states

#### Component Organization
```
components/
├── ui/           # Reusable UI components
├── charts/       # Data visualization components
├── report/       # Report-specific components
└── icons/        # Icon components
```

#### Example Component Pattern
```typescript
import { Box, HStack } from "@chakra-ui/react"
import type { ComponentProps } from "@/types"

interface Props {
  title: string
  isValid?: boolean
}

export function ExampleComponent({ title, isValid = true }: Props) {
  return (
    <Box borderColor={!isValid ? "red.300" : undefined}>
      <HStack spacing={4}>
        {/* Component content */}
      </HStack>
    </Box>
  )
}
```

### Backend (Python)

#### Code Quality Tools
- **Ruff**: Linting and formatting
  - 120 character line width
  - Python 3.12+ target
  - pycodestyle, pyflakes, isort, flake8-bugbear rules
  - Import organization with isort

#### Project Structure
- **Source**: Code in `src/` directory
- **Tests**: Separate `tests/` directory with pytest
- **Schemas**: Pydantic models for API validation
- **Services**: Business logic separation
- **Repositories**: Data access layer

#### Python Conventions
- **Type Hints**: Required for all function signatures
  - prohibited: List, Dict, Tuple, Optional
  - recommended: list, dict, tuple, type | None
- **Docstrings**: JSDoc-style comments for documentation
- **Error Handling**: Structured exception handling
- **Async/Await**: FastAPI async patterns

#### Dependencies Management
- **Rye**: Modern Python dependency management
- **pyproject.toml**: Standard Python project configuration

### Git Workflow

#### Pre-commit Hooks (Lefthook)
- **client-lint**: Biome checks for client code
- **client-admin-lint**: Biome checks for admin code
- **dummy-server-lint**: Biome checks for utility code

#### Commit Guidelines
- Clear, descriptive commit messages
- Separate commits for different concerns
- Reference issues when applicable

#### Branch Strategy
- Feature branches from main
- Pull requests for code review
- CI/CD validation before merge

### File Naming Conventions

#### Frontend
- **Components**: PascalCase (`Header.tsx`, `BasicInfoSection.tsx`)
- **Hooks**: camelCase with `use` prefix (`useBasicInfo.ts`)
- **Utils**: camelCase (`validation.ts`, `api.ts`)
- **Types**: camelCase (`index.ts` in types directories)

#### Backend
- **Modules**: snake_case (`report_launcher.py`)
- **Classes**: PascalCase
- **Functions**: snake_case
- **Constants**: UPPER_SNAKE_CASE

### Testing Standards

#### Frontend Testing
- **Jest**: Unit tests for components and utilities
- **Playwright**: E2E tests for user workflows
- **Test files**: `*.test.ts` or `__tests__/` directories

#### Backend Testing
- **pytest**: Unit and integration tests
- **Coverage**: pytest-cov for coverage reporting
- **Test files**: `test_*.py` pattern

### Documentation
- **JSDoc**: For complex functions and hooks
- **README**: Per-service documentation
- **Type definitions**: Comprehensive TypeScript/Python types

## Contributing
This is an open-source project welcoming contributions. See `CONTRIBUTING.md` for guidelines. The project also involves collaboration with Devin AI engineer.