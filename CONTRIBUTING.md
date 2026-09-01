# Contributing to OmniRoute

Thanks for helping build a universal AI gateway! Every PR is welcome.

## Getting started

```bash
git clone https://github.com/maqsadjon57-code/OmniRoute.git
cd OmniRoute
npm install
npm run dev
```

Open <http://localhost:20128>.

## Good first tasks

- Add a provider to `lib/providers/catalog.ts`.
- Add a compression rule to `lib/compression/index.ts`.
- Add a routing strategy to `lib/combos/index.ts`.
- Add a dashboard component, test, or i18n translation.

## Rules

- Keep TypeScript strict (`npm run typecheck`).
- Keep lint clean (`npm run lint`).
- Keep tests green (`npm test`).
- Add a test or unit comment for new domain logic.

## Commits

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `tests:`.

## Branches & releases

We use a short-lived feature branch flow. Releases are tagged `vX.Y.Z`; npm and
Docker publish automatically from GitHub Actions.

## License

By contributing you agree that your contributions are licensed under the MIT License.
