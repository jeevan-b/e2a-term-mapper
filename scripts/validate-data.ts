import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { termsDataSchema } from '@term-mapper/shared-types';

const dataPath = resolve(process.cwd(), 'data/terms.json');
const raw = await readFile(dataPath, 'utf8');
termsDataSchema.parse(JSON.parse(raw));
console.log(`Validated ${dataPath}`);
