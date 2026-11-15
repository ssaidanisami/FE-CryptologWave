# Claude Agent Skills & Operational Guidelines (`skills.md`)

This document defines the skills, operational standards, conventions, and behavioral rules for Anthropic Claude and LLM/autonomous agents operating within the **FE-CryptologWave** codebase.

---

## 1. Project Overview & Architecture

- **Stack**: Angular (Standalone Components), Nx Monorepo, PrimeNG (`@primeng/themes`), Keycloak (`keycloak-angular`), RxJS / Signals, Vitest, Cypress, ESLint, Prettier.
- **Applications**:
  - `employee-portal`: Main frontend application (`apps/` or `employee-portal/`).
- **Libraries Structure (`libs/`)**:
  - `employee/data-access`: Services, state management, HTTP API communication (`@fe-cryptolog-wave/data-access`).
  - `employee/feature-*`: Smart/container components, page routing (`@fe-cryptolog-wave/feature-list`, `@fe-cryptolog-wave/feature-detail`, `@fe-cryptolog-wave/feature-department`).
  - `employee/ui`: Dumb/presentational reusable components (`@fe-cryptolog-wave/ui`).
  - `shared/ui`: Cross-domain presentation components (`@fe-cryptolog-wave/shared-ui`).
  - `shared/utils`: Pure helper functions, formatting, shared utilities (`@fe-cryptolog-wave/shared-utils`).

---

## 2. Core Agent Skills

### Skill: Monorepo & Task Management (Nx CLI)
Agents must execute tasks using Nx commands:
- **Start Development Server**: `npm run start` or `npx nx serve employee-portal`
- **Build**: `npm run build` or `npx nx build employee-portal`
- **Unit Testing**: `npm run test` or `npx nx test employee-portal` / `npm run test:all`
- **Component Testing**: `npm run component-test:feature-detail` / `npm run component-test:all`
- **Linting**: `npm run lint` or `npm run lint:all`
- **Code Generation**: Use Nx schematics (`npx nx g @nx/angular:lib <name>`) rather than ad-hoc file generation when creating modules/libraries.

### Skill: Angular & Architecture Best Practices
- **Standalone Components**: Always prefer standalone components with explicit imports (`imports: [...]`).
- **Modern Reactivity**: Use Signals (`signal()`, `computed()`, `input()`, `output()`) where applicable alongside RxJS observables.
- **Module Boundaries**: Strictly respect path aliases configured in `tsconfig.base.json`. Do not use relative cross-boundary imports (e.g. avoid `../../libs/...`).
- **UI Components**: Integrate PrimeNG components following design tokens and theme settings.
- **Authentication**: Rely on `KeycloakService` / `keycloak-angular` patterns for route guards and token injection.

### Skill: Testing & Quality Assurance
- **Unit Tests**: Write and maintain unit tests using Vitest and `@angular/core/testing`.
- **Component Tests**: Maintain Cypress component tests under feature libraries.
- **Linting & Formatting**: Ensure zero ESLint errors and format with Prettier before completing changes.

---

## 3. Rules of Using LLM and Autonomous Agents

When interacting with this codebase, LLM agents must strictly adhere to the following rules:

### 1. Investigation & Context Gathering Before Editing
- **Inspect First**: Always read relevant source files, configurations (`tsconfig.base.json`, `package.json`), and tests before modifying or creating code.
- **Trace Dependencies**: Ensure understanding of affected libraries across the Nx graph before refactoring shared modules.

### 2. Minimal, Precise, and Non-Destructive Changes
- **Targeted Edits**: Only modify lines relevant to the task. Avoid unnecessary formatting sweeps or unrelated refactorings.
- **Preserve Existing Patterns**: Follow existing naming conventions, indentation, and structural idioms in the surrounding file.
- **No Hallucinated Dependencies**: Do not introduce new npm packages or external libraries unless explicitly requested.

### 3. Verification & Validation
- **Run Checks**: After implementing changes, run targeted linting and unit tests (`npm run lint`, `npm run test`).
- **Fix Regressions**: If tests fail, treat it as a regression caused by the edit and resolve the underlying issue. Never bypass tests by disabling assertions or deleting test files.

### 4. Code Quality & Security Standards
- **Strict Typing**: Maintain TypeScript typing. Avoid `any` types; prefer explicit interfaces and type guards.
- **No Secret Leaks**: Never hardcode credentials, tokens, or environment-specific secrets into frontend source files.
- **Security Awareness**: Sanitize any dynamic HTML rendering and properly handle Keycloak auth tokens.

### 5. Communication & Documentation
- **Clear Explanations**: Provide concise rationale for architectural decisions and code adjustments.
- **Keep Documentation Updated**: If APIs, inputs, outputs, or scripts change, update relevant markdown documentation and KDoc/JSDoc comments.
