# Bridged admin dashboard

The internal tool the Bridged team uses to run the platform: accounts (users, agents, playbooks), teams, companies, team credits and custom work.

It shares its design system with the Bridged portal: React 19, Tailwind CSS 4, shadcn/ui (`radix-luma`), Hugeicons and motion.

```bash
yarn install   # Yarn 4
yarn start     # dev server on http://localhost:3000 (staging API; ?env=dev|production to switch)
yarn build     # production build (the CI gate)
```

Before changing anything, read:

- [AGENTS.md](AGENTS.md): commands, stack, non-negotiables, git rules, definition of done
- [docs/design-system.md](docs/design-system.md): the UI standard
- [docs/architecture.md](docs/architecture.md): routing, folders, data layer
- [docs/product-rules.md](docs/product-rules.md): admin behaviour rules

Claude Code users: see [CLAUDE.md](CLAUDE.md) for the skills, the `ui-reviewer` subagent and the git guard hooks.
