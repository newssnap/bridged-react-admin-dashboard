const path = require('path');

/**
 * Build configuration on top of Create React App.
 * - Tailwind CSS 4 runs through PostCSS (see postcss.config.js).
 * - `@/` resolves to `src/`, matching the shadcn component imports.
 */
module.exports = {
  style: {
    postcss: {
      mode: 'file',
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  },
};
