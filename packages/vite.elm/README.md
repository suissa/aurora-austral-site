# vite.elm

`vite.elm` is the local Vite framework used by this repository to run Elm as the primary application runtime.

## Features

- `elm()` Vite plugin for `.elm` entrypoints.
- Production builds compile Elm with `--optimize`; dev builds compile with `--debug`.
- Companion fallback support for locked-down environments where the Elm package registry cannot be reached.
- `vite-elm-convert` CLI that scans React/JSX components and emits Elm migration sketches.

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
npx vite-elm-convert src/components --out converted-elm
```
