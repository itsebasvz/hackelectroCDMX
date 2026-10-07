import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
const metadata = JSON.parse(await readFile('docs/desarrollo/dependencias.json', 'utf8'));
await mkdir('dist/third-party', { recursive: true });
const notices = [];
for (const entry of metadata.entries) {
  if (entry.text) {
    await copyFile(entry.text, `dist/third-party/${basename(entry.text)}`);
    notices.push({ ...entry, text: `/third-party/${basename(entry.text)}` });
  }
}
await writeFile(
  'dist/third-party/licenses.json',
  JSON.stringify({ method: metadata.method, entries: notices }, null, 2),
);
await copyFile('LICENSE', 'dist/third-party/project-MIT.txt');
await copyFile(
  'docs/desarrollo/recursos-interfaz/OCTICONS-MIT.txt',
  'dist/third-party/Octicons-MIT.txt',
);
await copyFile(
  'docs/desarrollo/recursos-interfaz/procedencia.json',
  'dist/third-party/Octicons-procedencia.json',
);
console.log(`${notices.length} avisos originales incluidos en la distribución.`);
