import { cp, mkdir, rm } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const item of ['index.html', 'assets', 'audios_derrota', 'audios_vitoria', 'js']) {
  await cp(new URL(`../${item}`, import.meta.url), new URL(item, output), { recursive: true });
}

await mkdir(new URL('css/', output), { recursive: true });
for (const file of ['style.css', 'tailwind.css']) {
  await cp(new URL(`../css/${file}`, import.meta.url), new URL(`css/${file}`, output));
}
