#!/usr/bin/env node
/**
 * Mechanical checks for the Bridged dashboard UI standard (docs/design-system.md).
 *
 *   node .claude/skills/design-review/scripts/check-ui.js            # uncommitted changes (staged, unstaged, untracked)
 *   node .claude/skills/design-review/scripts/check-ui.js --branch   # everything this branch changed vs main
 *   node .claude/skills/design-review/scripts/check-ui.js --all      # every file under src/
 *   node .claude/skills/design-review/scripts/check-ui.js src/a.jsx  # specific files
 *
 * Findings are hints, not verdicts: read each one in context before changing code.
 * Exit code is 1 when any "error" finding exists, so it can gate CI if wanted.
 */
const { execSync } = require('child_process');
const fs = require('fs');

const root = execSync('git rev-parse --show-toplevel').toString().trim();
process.chdir(root);

const args = process.argv.slice(2);
const sh = cmd => {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
};

let files;
let changedKit = [];
if (args.includes('--all')) {
  files = sh('git ls-files src').split('\n');
} else if (args.length && !args.includes('--branch')) {
  files = args;
} else {
  const base = args.includes('--branch') ? sh('git merge-base HEAD main').trim() || 'HEAD' : 'HEAD';
  const changed = new Set(
    [
      ...sh(`git diff --name-only ${base}`).split('\n'),
      ...sh('git ls-files --others --exclude-standard src').split('\n'),
    ].filter(Boolean)
  );
  files = [...changed];
  changedKit = files.filter(f => f.startsWith('src/components/ui/'));
}
files = files.filter(f => /^src\/.*\.(jsx?|css)$/.test(f) && fs.existsSync(f));

// US → UK spellings for user-visible copy. Only matched inside quotes or JSX text.
const US_WORDS = [
  'color', 'colors', 'colored', 'center', 'centered', 'gray', 'behavior', 'behaviors',
  'favorite', 'favorites', 'organization', 'organizations', 'organize', 'customize',
  'customized', 'personalize', 'personalized', 'personalization', 'analyze', 'analyzed',
  'optimize', 'optimized', 'recognize', 'canceled', 'canceling', 'labeled', 'labeling',
  'license', 'catalog', 'visualize', 'visualization', 'summarize', 'prioritize',
  'synchronize', 'authorize', 'authorized', 'initialize', 'finalize', 'minimize',
  'maximize', 'categorize', 'standardize', 'modeled',
];
// Not next to "-", ":" or "." so Tailwind classes (items-center) and code (color-mix, x.color) don't match.
const usWordRe = new RegExp(`(?<![-\\w:.,[/])(${US_WORDS.join('|')})(?![-\\w:(,\\]/])`, 'i');

const RULES = [
  {
    id: 'no-antd',
    level: 'error',
    test: l => /from ['"](antd|@ant-design\/[^'"]+)['"]/.test(l),
    msg: 'antd is gone: use shadcn components from @/components/ui and app components from @/components.',
  },
  {
    id: 'icons-hugeicons',
    level: 'error',
    test: l => /from ['"](lucide-react|react-icons[^'"]*|@heroicons\/[^'"]+|@radix-ui\/react-icons)['"]/.test(l),
    msg: 'Icons are Hugeicons only: <HugeiconsIcon icon={XIcon} /> with icons from @hugeicons/core-free-icons.',
  },
  {
    id: 'no-new-css',
    level: 'error',
    test: (l, f) =>
      /\.jsx?$/.test(f) &&
      /import\s+['"][^'"]+\.(css|scss|less)['"]/.test(l) &&
      f !== 'src/index.js' &&
      !/@mdxeditor/.test(l),
    msg: 'No new stylesheets: use Tailwind utilities; shared tokens/utilities live in src/styles/globals.css.',
  },
  {
    id: 'no-inline-hex',
    level: 'warn',
    test: (l, f) => !f.endsWith('.css') && /(className|class)=.*\[#([0-9a-f]{3}|[0-9a-f]{6})\]/i.test(l),
    msg: 'Hard-coded colour in a class: use tokens (bg-primary, text-muted-foreground, bg-muted, …) so white-label and dark mode work.',
  },
  {
    id: 'no-white-on-primary',
    level: 'warn',
    test: l => /bg-primary\b/.test(l) && /\btext-white\b/.test(l),
    msg: 'Text on a brand surface must be text-primary-foreground (contrast-derived for white-label), not text-white.',
  },
  {
    id: 'radius-scale',
    level: 'warn',
    test: (l, f) => !f.startsWith('src/components/ui/') && /\brounded-(2xl|3xl|\[\d+px\])/.test(l),
    msg: 'Off the radius scale: surfaces rounded-lg, nested pieces rounded-md, dialogs/palette rounded-xl, pills rounded-full.',
  },
  {
    id: 'select-popper',
    level: 'warn',
    test: l => /<SelectContent[^>]*position=["']popper["']/.test(l),
    msg: 'Selects open item-aligned: drop position="popper" from SelectContent.',
  },
  {
    id: 'native-dialogs',
    level: 'error',
    test: l => /\bwindow\.(confirm|alert|prompt)\(|(^|[^.\w])alert\(/.test(l),
    msg: 'Use ConfirmDialog (@/components/confirm-dialog) or a toast, never native confirm/alert.',
  },
  {
    id: 'raw-table',
    level: 'warn',
    test: (l, f) => !f.startsWith('src/components/') && /<table[\s>]/.test(l),
    msg: 'Tables use DataTable from @/components/data-table.',
  },
  {
    id: 'progress-toast',
    level: 'warn',
    test: l =>
      /toast\.loading\(/.test(l) ||
      /toast(\.(info|message))?\(\s*['"`](?!Coming|Nothing|Something)[A-Z]\w*ing\b[^'"`]*['"`]/.test(l) ||
      /description:\s*['"`](?!Coming|Nothing|Something)[A-Z]\w*ing\b[^'"`]*['"`]/.test(l) && /toast/.test(l),
    msg: 'No "Deleting…" style progress toasts: one toast per action, past tense on success ("Agent deleted").',
  },
  {
    id: 'error-toast-copy',
    level: 'warn',
    test: l => /toast\.error\(\s*['"`](Failed to|Error while|Error |Something went wrong|Unable to)/.test(l),
    msg: 'Error toasts read "Couldn\'t <verb> the <thing>" (prefer the server\'s userErrorText when present).',
  },
  {
    id: 'success-toast-copy',
    level: 'warn',
    test: l => /toast\.success\([^)]*successfully/i.test(l) || /toast\.success\(\s*undefined/.test(l),
    msg: 'Success toasts are a short past-tense title ("Agent deleted"): no "successfully", never an empty title.',
  },
  {
    id: 'missing-value-dash',
    level: 'warn',
    test: l => /(\?\?|\|\||:)\s*['"]--['"]/.test(l),
    msg: 'Missing values read "—" (em dash), not "--".',
  },
  {
    id: 'number-locale',
    level: 'warn',
    test: l => /\.toLocaleString\(\s*\)/.test(l),
    msg: "Format numbers with the en-GB locale: toLocaleString('en-GB') or Intl.NumberFormat('en-GB').",
  },
  {
    id: 'hand-callout',
    level: 'warn',
    test: l => /className=.*\bbg-(amber|yellow|orange|red|green|blue)-\d{3}\/\d+/.test(l),
    msg: 'Callouts use the kit Alert tones (warning / destructive / brand / neutral, design-system §8) and status tokens, not raw palette tints.',
  },
  {
    id: 'three-dots',
    level: 'warn',
    test: l => /[A-Za-z]\.\.\.['"`<]/.test(l) && !/^\s*(\/\/|\*)/.test(l) && !/\.\.\.\w/.test(l),
    msg: 'Use the single ellipsis character "…" in copy ("Saving…").',
  },
  {
    id: 'badge-info-status',
    level: 'warn',
    test: l => /variant=["']info["'][^>]*>\s*(Active|Live|Paused|Draft|Scheduled|Upcoming|Indexing|Processing|Pending|Failed|Ready)/.test(l),
    msg: 'Badge "info" is the brand tint, not a status: see the status table in design-system §5 (sky for upcoming/in progress).',
  },
  {
    id: 'uk-english',
    level: 'warn',
    test: (l, f) => {
      if (f.endsWith('.css') || /^\s*(import|\/\/|\*)/.test(l)) return false;
      // CSS values in style objects are code, not copy.
      if (/\b(transformOrigin|backgroundPosition|objectPosition|textAlign|alignItems|justifyContent)\b|color-mix\(/.test(l)) return false;
      // Only quoted strings that look like prose (contain a space or start upper-case) and JSX text.
      const strings = [
        ...(l.match(/'[^']*'|"[^"]*"|`[^`]*`/g) || []).filter(s => / /.test(s) || /^.[A-Z]/.test(s)),
        ...(l.match(/>[^<>{}]+</g) || []),
      ].filter(s => !/(className|cn\(|var\(|--|\b(text|bg|border|ring|fill|stroke)-)/.test(s));
      return strings.some(s => usWordRe.test(s));
    },
    msg: 'User-visible copy is UK English (colour, centre, grey, behaviour, -ise). Keep code identifiers and API fields as they are.',
  },
];

const findings = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const r of RULES) {
      if (r.test(line, f)) findings.push({ ...r, file: f, line: i + 1, text: line.trim().slice(0, 140) });
    }
  });
}

for (const f of changedKit) {
  findings.push({
    id: 'kit-edited',
    level: 'warn',
    file: f,
    line: 1,
    text: '',
    msg: 'src/components/ui/* is the Bridged-tuned shadcn kit: a change here restyles every screen. Make sure it is deliberate and global; page-specific styling belongs at the call site or in src/components/*.',
  });
}

if (!files.length && !changedKit.length) {
  console.log('No changed UI files to check (pass --all or file paths).');
  process.exit(0);
}

const byLevel = l => findings.filter(f => f.level === l).length;
for (const f of findings) {
  console.log(`${f.level.toUpperCase().padEnd(5)} ${f.file}:${f.line}  [${f.id}] ${f.msg}`);
  if (f.text) console.log(`      ${f.text}`);
}
console.log(
  `\nChecked ${files.length} file(s): ${byLevel('error')} error(s), ${byLevel('warn')} warning(s).` +
    (findings.length ? '' : ' Clean.')
);
process.exit(byLevel('error') ? 1 : 0);
