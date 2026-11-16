# Contributing to CivicBridge

First off, thank you for considering contributing to CivicBridge! It's people like you that make this open-source civic-tech platform possible.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please create an issue using the Bug Report template.

### Suggesting Enhancements
If you have an idea for a new feature or improvement, please use the Feature Request template.

### Updating Civic Information
Public service information changes frequently. If you notice outdated or incorrect information in our mock data or service guides, please open an issue using the Incorrect Information template, or submit a Pull Request.

## Pull Request Process
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes.
4. Make sure your code adheres to our code style (we use ESLint/Prettier).
5. Run the security checks (see below) before you push.
6. Update documentation if necessary.
7. Issue that pull request!

## Testing
Run unit and integration tests locally with Vitest:
```bash
npm test                                                      # run all tests
npm test -- --run src/services/roadSafetyBlackspotService.test.js # road-safety blackspot engine tests (#769)
npm test -- --run src/pages/RoadSafetyDashboard.test.jsx          # road-safety dashboard workspace UI tests (#769)
npm test -- --run src/components/admin/RoadHazardReviewQueue.test.jsx # road-safety hazard review queue tests (#769)
npm test -- --run tests/road-hazards.test.js                     # road-safety hazard API validation & abuse tests (#769)
npm test -- --run src/services/provenanceService.test.js       # lineage DAG & cycle prevention tests (#777)
npm test -- --run src/pages/LineageExplorerWorkspace.test.jsx  # provenance explorer UI tests (#777)
npm test -- --run tests/knowledge-provenance.test.js          # provenance serverless API tests (#777)
npm test -- --run tests/knowledge-provenance-security.test.js # provenance security & PII tests (#777)
npm test -- --run src/services/citizenDraftSyncEngine.test.js # offline-first sync engine tests (#775)
npm test -- --run src/pages/CitizenDraftSyncWorkspace.test.jsx # sync workspace UI tests (#775)
npm test -- --run src/services/continuityPlannerService.test.js # continuity planner service & state machine tests (#780)
npm test -- --run src/services/dependencyGraphEngine.test.js  # graph analysis, cycle detection & SPOF tests (#780)
npm test -- --run src/pages/ContinuityPlannerWorkspace.test.jsx # incident response drill workspace & runbook tests (#780)
npm test -- --run src/services/counterDemandForecastingService.test.js # counter demand forecasting tests (#764)
npm test -- --run src/pages/CounterDemandForecastingWorkspace.test.jsx # counter demand workspace UI tests (#764)
npx vitest run src/services/treeInventoryService.test.js       # tree inventory domain/security tests (#749)
npx vitest run src/services/treeInventoryMigrations.test.js    # tree schema migration/rollback tests (#749)
npx vitest run src/pages/TreeHealthInventory.test.jsx          # tree page public-projection tests (#749)
npx vitest run src/components/trees/TreeInventoryComponents.test.jsx # tree component/accessibility tests (#749)
npx vitest run src/services/pedestrianBarrierService.test.js       # pedestrian barrier graph & service tests (#757)
npx vitest run src/services/pedestrianBarrierMigrations.test.js    # pedestrian schema migration/rollback tests (#757)
npx vitest run tests/pedestrian-barriers.test.js                   # pedestrian barrier API validation tests (#757)
npx vitest run tests/pedestrian-barriers-security.test.js          # pedestrian security, injection & replay tests (#757)
npx vitest run src/pages/AccessibleRouteBarrierWorkspace.test.jsx  # accessible barrier workspace UI tests (#757)
```

Architecture, data model, state machine, graph routing rules, and verification integrity for the accessible pedestrian route barrier map are documented in [docs/ACCESSIBLE_PEDESTRIAN_ROUTE_BARRIERS.md](docs/ACCESSIBLE_PEDESTRIAN_ROUTE_BARRIERS.md).

## Security checks
Every PR runs a secret scan, a dependency audit and a lint for unsafe HTML/JS patterns. Locally:
```bash
npm run lint:security
node scripts/security/audit-report.mjs --omit-dev --level high
gitleaks dir . --config .gitleaks.toml --redact --no-banner   # needs gitleaks installed
```
Never commit real keys (frontend `VITE_` variables are public). What each check does, what to do when one fails, and how to handle false positives: [docs/SECURITY_CHECKS.md](docs/SECURITY_CHECKS.md).

## Code Style
- We use standard React conventions.
- Use functional components and hooks.
- Semantic HTML is required for accessibility.
- CSS is handled via Vanilla CSS in `index.css`. Please use existing CSS variables for colors, typography, and spacing.
