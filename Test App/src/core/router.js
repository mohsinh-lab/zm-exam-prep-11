
export class Router {
    constructor(routes, rootElementId) {
        this.routes = routes;
        this.rootElement = document.getElementById(rootElementId);
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash || '#/student/home';
        const [path, query] = hash.split('?');
        const route = this.routes.find(r => this.matchRoute(r.path, path));

        if (route) {
            const params = this.extractParams(route.path, path);
            const content = route.render(params, query);
            this.rootElement.innerHTML = content;
            if (route.mount) {
                requestAnimationFrame(() => route.mount(params, query));
            }
            this.updateActiveLinks(path);
        } else {
            // Default fallback
            window.location.hash = '#/student/home';
        }
    }

    matchRoute(routePath, path) {
        const routeParts = routePath.split('/');
        const pathParts = path.split('/');
        if (routeParts.length !== pathParts.length) return false;
        return routeParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
    }

    extractParams(routePath, path) {
        const params = {};
        const routeParts = routePath.split('/');
        const pathParts = path.split('/');
        routeParts.forEach((part, i) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = pathParts[i];
            }
        });
        return params;
    }

    updateActiveLinks(path) {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === path);
        });
    }

    navigate(path) {
        window.location.hash = path;
    }
}
