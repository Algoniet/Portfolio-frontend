# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Run development server (http://localhost:4200)
- `npm run build` - Production build (outputs to `dist/`)
- `npm run watch` - Development build with watch mode
- `npm test` - Run unit tests with Karma
- `ng generate component component-name` - Generate a new component

## Architecture

This is an **Angular 20** portfolio application using standalone components (no NgModules).

### Project Structure

```
src/app/
├── core/                    # Singleton services and models
│   ├── models/              # TypeScript interfaces (Project, GitHubRepo)
│   └── services/            # GitHub service for API integration
│       └── github/
├── features/                # Page-level components (routes)
│   ├── home/home/
│   ├── about/about/
│   ├── project-detail/
│   └── contact/
│       └── contact.service.ts   # HTTP client for backend
└── shared/                  # Reusable components
    └── components/
        ├── navbar/
        ├── footer/
        └── project-card/
```

### Key Implementation Details

**GitHub Integration** (`core/services/github/github.service.ts`):
- Fetches repositories from `https://api.github.com/users/Algoniet/repos`
- Implements client-side caching (1 hour) via localStorage
- Maps repo topics/languages to technology icons (devicon classes)
- Falls back to local projects if API fails

**CSS Architecture** (`src/styles.css`):
- Single global stylesheet using CSS custom properties (variables)
- All CSS variables defined in `:root` selector
- Components use individual `styleUrl: './component.css'` for component-specific styles
- Media queries use standard breakpoint values: 575.98px, 767.98px, 991.98px, 1199.98px

**Routing** (`app.routes.ts`):
- Standard Angular Router with view transitions enabled
- Routes: `/`, `/about`, `/projects`, `/projects/:id`, `/contact`
- Wildcard redirect to home for 404s

**Contact Form**:
- Backend endpoint: `http://localhost:8080/portfolio/contact`
- Uses `ContactService` with `HttpClient` for POST requests

**Icons**:
- FontAwesome 5 (loaded via CDN in index.html)
- Devicon (technology icons, loaded via CDN)
- Both class-based icon systems (no SVG icons)

### Testing

Tests use Karma + Jasmine. Each component has a `.spec.ts` file alongside it.
- Run single test: `ng test --include='**/component-name.spec.ts'` (not directly supported, filter in browser)
- Tests run in Chrome by default

### TypeScript Configuration

- Strict mode enabled
- Uses `module: "preserve"` (Angular 20 default)
- Target: ES2022
