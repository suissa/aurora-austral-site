import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const elmEntrypointRegex = /\.elm$/;

function normalize(id) {
  return id.split('?')[0];
}

function findElmBinary() {
  const local = path.resolve(process.cwd(), 'node_modules/.bin/elm');
  if (fs.existsSync(local)) return local;
  return process.platform === 'win32' ? 'elm.cmd' : 'elm';
}

export function elm(options = {}) {
  const mode = options.mode ?? 'debug';
  const fallback = options.fallback ?? 'companion';
  return {
    name: 'vite.elm',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!elmEntrypointRegex.test(source)) return null;
      if (source.startsWith('.') && importer) {
        return path.resolve(path.dirname(normalize(importer)), source);
      }
      return path.resolve(process.cwd(), source);
    },
    load(id) {
      const file = normalize(id);
      if (!elmEntrypointRegex.test(file)) return null;
      this.addWatchFile(file);

      const hash = crypto.createHash('sha1').update(file + mode + Date.now()).digest('hex');
      const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `vite-elm-${hash}-`));
      const outFile = path.join(outDir, 'elm.js');
      const args = ['make', file, '--output', outFile];

      if (mode === 'optimize') args.push('--optimize');
      if (mode === 'debug') args.push('--debug');

      try {
        execFileSync(findElmBinary(), args, {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe'],
          env: process.env,
        });
        const compiled = fs.readFileSync(outFile, 'utf8');
        return `${compiled}\nexport { Elm };`;
      } catch (error) {
        const stderr = error.stderr?.toString() ?? error.message;
        if (fallback === 'companion') {
          const companion = file.replace(/\.elm$/, '.fallback.js');
          if (fs.existsSync(companion)) {
            this.warn(`Elm compiler is unavailable, using companion fallback for ${file}: ${stderr.split('\n')[0]}`);
            return fs.readFileSync(companion, 'utf8');
          }
        }
        this.error(`Elm compilation failed for ${file}:\n${stderr}`);
      } finally {
        fs.rmSync(outDir, { recursive: true, force: true });
      }
      return null;
    },
  };
}

export { convertReactComponent, convertReactProject } from './converter.js';
export default elm;
