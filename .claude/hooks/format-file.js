#!/usr/bin/env node
/**
 * PostToolUse hook (Edit | Write): runs Prettier on the file Claude just
 * changed, using the repo's .prettierrc. Same scope as lint-staged:
 * src/**\/*.{js,jsx,ts,tsx,json,css,scss,md}. Never blocks.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  try {
    const file = JSON.parse(input).tool_input?.file_path;
    const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    if (!file) return;

    const rel = path.relative(root, file);
    if (!rel.startsWith('src' + path.sep)) return;
    if (!/\.(js|jsx|ts|tsx|json|css|scss|md)$/.test(file)) return;

    const prettier = path.join(root, 'node_modules', '.bin', 'prettier');
    if (!fs.existsSync(prettier)) return;

    execFileSync(prettier, ['--write', '--log-level', 'warn', file], { cwd: root, stdio: 'ignore' });
  } catch {
    // Formatting is best effort; lint-staged formats again on commit.
  }
});
