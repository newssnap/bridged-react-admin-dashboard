#!/usr/bin/env node
/**
 * PreToolUse hook (Bash): stops Claude from running git commands that
 * deploy, rewrite shared history or throw away work.
 *
 * - main → prod, staging → stage, development → dev (see .github/workflows)
 * - pre_prod is the shared team branch
 *
 * Exit code 2 blocks the call and shows stderr to Claude.
 */
const { execSync } = require('child_process');

const PROTECTED = ['main', 'master', 'pre_prod', 'staging'];

const currentBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
};

let input = '';
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input).tool_input?.command || '';
  } catch {
    process.exit(0);
  }

  const block = reason => {
    process.stderr.write(
      `Blocked by .claude/hooks/guard-git.js: ${reason}\n` +
        'Ask the user to run this themselves if it is really intended.\n'
    );
    process.exit(2);
  };

  // Look at each chained command separately (&&, ||, ;, |, newline).
  const parts = command.split(/&&|\|\||;|\||\n/).map(p => p.trim());
  for (const part of parts) {
    if (!/^git\b/.test(part)) continue;

    if (/^git\s+push\b/.test(part)) {
      if (/(\s--force\b|\s-f\b|\s--force-with-lease\b|\s\+\S)/.test(part)) {
        block('force pushes are not allowed.');
      }
      if (/\b(main|master|pre_prod|staging)\b/.test(part) || PROTECTED.includes(currentBranch())) {
        block('pushing to main, pre_prod or staging is not allowed (they deploy or are shared).');
      }
      if (/\s--(all|mirror|delete)\b/.test(part) || /\s:\S/.test(part)) {
        block('pushing all branches, mirroring or deleting remote branches is not allowed.');
      }
    }
    if (/^git\s+reset\s+.*--hard\b/.test(part)) block('git reset --hard discards work.');
    if (/^git\s+clean\s+.*-\w*f/.test(part)) block('git clean -f deletes untracked files.');
    if (/^git\s+branch\s+.*-D\b/.test(part)) block('git branch -D force-deletes a branch.');
    if (/^git\s+(checkout|restore)\s+(--\s+)?\.\s*$/.test(part)) {
      block('discarding all working-tree changes is not allowed.');
    }
  }
  process.exit(0);
});
