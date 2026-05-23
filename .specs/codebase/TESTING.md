# Testing Infrastructure

## Test Frameworks

**Unit/Integration:** Vitest + React Testing Library
**E2E:** Playwright
**Coverage:** Vitest coverage (c8/v8)

## Test Organization

**Location:** `src/__tests__/` (Unit & Integration), `e2e/` (E2E)
**Naming:** `*.test.ts` or `*.test.tsx` for unit/integration, `*.spec.ts` for E2E
**Structure:**
- `src/__tests__/unit/`: Hooks, services, and utility logic
- `src/__tests__/components/`: Core UI components
- `src/__tests__/pages/`: Page-level integration tests
- `e2e/`: Full flow E2E tests

## Testing Patterns

### Unit Tests
- Mock Axios requests using `msw` or `vi.mock`
- Use `@testing-library/react-hooks` or `renderHook` for custom hooks (`useAutoScroll`, `useTranspose`)

### Integration Tests
- Render page components with `MemoryRouter` and custom providers (`AuthContext`, `ToastContext`)
- Verify transitions and user event flows using `@testing-library/user-event`

### E2E Tests
- Test full auth flows, song creation, transposing, and playlist management using real or mocked API responses

## Test Execution

**Commands:**
- Run unit/integration tests: `npm run test`
- Run E2E tests: `npm run test:e2e`
- Run tests with coverage: `npm run test:coverage`

## Test Coverage Matrix

| Code Layer | Required Test Type | Location Pattern | Run Command |
| --- | --- | --- | --- |
| Services & Hooks | unit | `src/__tests__/unit/**/*.test.ts` | `npm run test` |
| UI Components | unit | `src/__tests__/components/**/*.test.tsx` | `npm run test` |
| Pages (Integration) | integration | `src/__tests__/pages/**/*.test.tsx` | `npm run test` |
| Full Flows (E2E) | e2e | `e2e/**/*.spec.ts` | `npm run test:e2e` |
| Routing / Contexts | integration | `src/__tests__/pages/**/*.test.tsx` | `npm run test` |

## Parallelism Assessment

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| unit | Yes | InMemory / Mocks | No shared state between tests; Vitest runs files in parallel threads |
| integration | Yes | Isolated Render / Mocks | JSDOM isolate instances per test file |
| e2e | No | Shared Browser Port / DB state | Standard Playwright requires serial execution to avoid database race conditions |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test` |
| Full | After tasks with e2e/integration tests | `npm run test && npm run test:e2e` |
| Build | After phase completion | `npm run build && npm run test` |
