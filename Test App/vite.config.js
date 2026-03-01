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
        exclude: ['**/node_modules/**', '**/dist/**', 'tests/ui.spec.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                'dist/',
                '**/*.spec.js',
                '**/*.test.js',
                'vite.config.js'
            ]
        }
    }
})
