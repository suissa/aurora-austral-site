#!/usr/bin/env node
import path from 'node:path';
import { convertReactProject } from '../src/converter.js';

const [input = 'src', ...rest] = process.argv.slice(2);
const outFlag = rest.indexOf('--out');
const output = outFlag >= 0 ? rest[outFlag + 1] : 'converted-elm';
const converted = convertReactProject(path.resolve(input), path.resolve(output));

for (const item of converted) {
  console.log(`${path.relative(process.cwd(), item.input)} -> ${path.relative(process.cwd(), item.output)}`);
}
console.log(`Converted ${converted.length} React component(s) with vite.elm.`);
