# Contributing to ESPConnect

Thanks for contributing!

## Quick rules
- Please open a Pull Request against `main` (direct pushes to `main` are disabled).
- Keep PRs focused (one feature/fix per PR if possible).
- Make sure CI passes.

## Development
1. Install deps:
   - `npm ci`
2. Run dev server:
   - `npm run dev`
3. Build:
   - `npm run build`

## Code style
- Run lint if available: `npm run lint`
- Run typecheck if available: `npm run typecheck`

## Translations (i18n)
- Keep strings consistent with existing keys.
- Avoid changing formatting/whitespace unless required.
- Please do not translate technical terms unless the UI already does so consistently.
