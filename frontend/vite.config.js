import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import codegen from 'vite-plugin-graphql-codegen';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)']
  }
})
