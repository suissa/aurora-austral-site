#!/usr/bin/env node
import path from 'node:path';
import { convertReactProject, SHADCN_COMPONENTS } from '../src/converter.js';

const args = process.argv.slice(2);
const outFlag = args.indexOf('--out');
const listFlag = args.includes('--list-shadcn');
const input = args.find((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--out') ?? 'src';
const output = outFlag >= 0 ? args[outFlag + 1] : 'converted-elm';

if (listFlag) {
  console.log(`shadcn/ui mappings: ${SHADCN_COMPONENTS.join(', ')}`);
}

const converted = convertReactProject(path.resolve(input), path.resolve(output));

for (const item of converted) {
  console.log(`${path.relative(process.cwd(), item.input)} -> ${path.relative(process.cwd(), item.output)}`);
}
console.log(`Converted ${converted.length} React TS/TSX component(s) with vite.elm.`);
