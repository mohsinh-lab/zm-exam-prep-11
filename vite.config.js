import { defineConfig } from 'vite'

export default defineConfig({
    base: '/zm-exam-prep-11/',
    root: '.',
    server: {
        port: 5173,
        host: true,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.js'],
        exclude: ['**/node_modules/**', '**/dist/**', 'tests/ui.spec.js']
    }
})
