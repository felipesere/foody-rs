/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      spacing: {
        '1ch': '1ch',
        '2ch': '2ch',
        '3ch': '3ch',
        '4ch': '4ch',
        '5ch': '5ch',
        '6ch': '6ch',
        '8ch': '8ch',
        '10ch': '10ch',
        '12ch': '12ch',
        '16ch': '16ch',
        '20ch': '20ch',
        '24ch': '24ch',
        '32ch': '32ch',
        '40ch': '40ch',
        '48ch': '48ch',
        '60ch': '60ch',
        '80ch': '80ch',
        '1lh': 'var(--line-height)',
        '2lh': 'calc(var(--line-height) * 2)',
        '3lh': 'calc(var(--line-height) * 3)',
        '4lh': 'calc(var(--line-height) * 4)',
        '5lh': 'calc(var(--line-height) * 5)',
        '6lh': 'calc(var(--line-height) * 6)',
        '8lh': 'calc(var(--line-height) * 8)',
        '10lh': 'calc(var(--line-height) * 10)',
        '0.5lh': 'calc(var(--line-height) * 0.5)',
      },
    },
  },
  plugins: [],
}

