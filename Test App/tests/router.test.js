import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '../src/core/router.js';

describe('Router', () => {
    let router;
    let rootElement;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '<div id="test-root"></div>';
        rootElement = document.getElementById('test-root');

        // Clear hash
        window.location.hash = '';
    });

    afterEach(() => {
        if (router) {
            window.removeEventListener('hashchange', router.handleRoute);
        }
    });

    describe('Route Matching', () => {
        it('should match exact routes', () => {
            const mockRender = vi.fn(() => '<div>Home</div>');
            const routes = [
                { path: '#/home', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/home';
            router.handleRoute();

            expect(mockRender).toHaveBeenCalled();
            expect(rootElement.innerHTML).toContain('Home');
        });

        it('should match routes with parameters', () => {
            const mockRender = vi.fn((params) => `<div>Subject: ${params.subject}</div>`);
            const routes = [
                { path: '#/quiz/:subject', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/quiz/maths';
            router.handleRoute();

            expect(mockRender).toHaveBeenCalledWith({ subject: 'maths' }, undefined);
            expect(rootElement.innerHTML).toContain('Subject: maths');
        });

        it('should extract multiple parameters', () => {
            const mockRender = vi.fn((params) => 
                `<div>${params.category}/${params.id}</div>`
            );
            const routes = [
                { path: '#/:category/:id', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/student/123';
            router.handleRoute();

            expect(mockRender).toHaveBeenCalledWith(
                { category: 'student', id: '123' },
                undefined
            );
        });

        it('should handle query strings', () => {
            const mockRender = vi.fn((params, query) => 
                `<div>Query: ${query}</div>`
            );
            const routes = [
                { path: '#/home', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/home?tab=profile';
            router.handleRoute();

            expect(mockRender).toHaveBeenCalledWith({}, 'tab=profile');
        });

        it('should fallback to default route if no match', () => {
            const mockRender = vi.fn(() => '<div>Home</div>');
            const routes = [
                { path: '#/student/home', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/unknown';
            router.handleRoute();

            // Should redirect to default
            expect(window.location.hash).toBe('#/student/home');
        });
    });

    describe('Mount Functions', () => {
        it('should call mount function after render', async () => {
            const mockRender = vi.fn(() => '<div id="test">Content</div>');
            const mockMount = vi.fn();
            const routes = [
                { path: '#/home', render: mockRender, mount: mockMount }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/home';
            router.handleRoute();

            // Mount is called in requestAnimationFrame
            await new Promise(resolve => requestAnimationFrame(() => {
                expect(mockMount).toHaveBeenCalled();
                resolve();
            }));
        });

        it('should pass parameters to mount function', async () => {
            const mockRender = vi.fn(() => '<div>Quiz</div>');
            const mockMount = vi.fn();
            const routes = [
                { path: '#/quiz/:subject', render: mockRender, mount: mockMount }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/quiz/english';
            router.handleRoute();

            await new Promise(resolve => requestAnimationFrame(() => {
                expect(mockMount).toHaveBeenCalledWith({ subject: 'english' }, undefined);
                resolve();
            }));
        });
    });

    describe('Navigation', () => {
        it('should navigate to new route', () => {
            const routes = [
                { path: '#/home', render: () => '<div>Home</div>' },
                { path: '#/about', render: () => '<div>About</div>' }
            ];

            router = new Router(routes, 'test-root');
            router.navigate('#/about');

            expect(window.location.hash).toBe('#/about');
        });

        it('should trigger route change on navigate', () => {
            const mockRender = vi.fn(() => '<div>About</div>');
            const routes = [
                { path: '#/home', render: () => '<div>Home</div>' },
                { path: '#/about', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            router.navigate('#/about');
            router.handleRoute();

            expect(mockRender).toHaveBeenCalled();
        });
    });

    describe('Active Links', () => {
        it('should update active class on links', () => {
            document.body.innerHTML = `
                <div id="test-root"></div>
                <a href="#/home">Home</a>
                <a href="#/about">About</a>
            `;

            const routes = [
                { path: '#/home', render: () => '<div>Home</div>' },
                { path: '#/about', render: () => '<div>About</div>' }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/home';
            router.handleRoute();

            const homeLink = document.querySelector('a[href="#/home"]');
            const aboutLink = document.querySelector('a[href="#/about"]');

            expect(homeLink.classList.contains('active')).toBe(true);
            expect(aboutLink.classList.contains('active')).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty hash', () => {
            const mockRender = vi.fn(() => '<div>Default</div>');
            const routes = [
                { path: '#/student/home', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '';
            router.handleRoute();

            // Router should handle empty hash by using default or redirecting
            // The actual behavior depends on implementation
            expect(mockRender).toHaveBeenCalled();
        });

        it('should handle routes with different lengths', () => {
            const mockRender = vi.fn(() => '<div>Match</div>');
            const routes = [
                { path: '#/a/b/c', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/a/b';
            router.handleRoute();

            // Should not match and fallback
            expect(mockRender).not.toHaveBeenCalled();
        });

        it('should handle special characters in parameters', () => {
            const mockRender = vi.fn((params) => `<div>${params.id}</div>`);
            const routes = [
                { path: '#/item/:id', render: mockRender }
            ];

            router = new Router(routes, 'test-root');
            window.location.hash = '#/item/test-123';
            router.handleRoute();

            expect(mockRender).toHaveBeenCalledWith({ id: 'test-123' }, undefined);
        });
    });
});
