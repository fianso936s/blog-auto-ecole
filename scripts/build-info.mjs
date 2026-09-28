import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('public', { recursive: true });
const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local';
writeFileSync('public/version.json', JSON.stringify({ release: 'webedrive-unified-1', commit: /^[a-f0-9]{40}$/.test(sha) ? sha : 'local', builtAt: new Date().toISOString() }, null, 2) + '\n');
