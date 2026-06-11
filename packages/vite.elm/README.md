# vite.elm

`vite.elm` is the local Vite framework used by this repository to run Elm as the primary application runtime.

## Features

- `elm()` Vite plugin for `.elm` entrypoints.
- Production builds compile Elm with `--optimize`; dev builds compile with `--debug`.
- Companion fallback support for locked-down environments where the Elm package registry cannot be reached.
- `vite-elm-convert` CLI that scans React TS/TSX/JSX files and emits Elm modules.
- First-class mappings for ten common shadcn/ui component families: `Button`, `Card`, `Input`, `Dialog`, `DropdownMenu`, `Form`, `Table`, `Badge`, `Avatar`, and `Tabs`.

## Usage

```ts
import { defineConfig } from 'vite'
import { elm } from 'vite.elm'

export default defineConfig({
  plugins: [elm()]
})
```

Convert React components incrementally:

```bash
npx vite-elm-convert src/components --out converted-elm --list-shadcn
```

The converter translates known shadcn/ui JSX tags into `Html.*` nodes and `Html.Attributes` calls. Unsupported React components are emitted as `Html.div` wrappers with a `converted-*` class so they remain visible and easy to finish manually.
