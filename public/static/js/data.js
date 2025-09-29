const API_BASE_URL = 'http://localhost:8080/api/v1';

export class apiServises {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
            return null;
        }
        
        const data = await response.json();
        console.log(`Success: ${endpoint}`, data);
        return data;
    }

    async getMainPageData() {
        return this.request('/home');
    }

    async loginUser(login, password) {
        return this.request('/login', {
            method: 'POST',
            body: { login, password }
        });
    }

    async registerUser(login, email, password) {
        return this.request('/register', {
            method: 'POST',
            body: { login, email, password }
        });
    }

    async logoutUser() {
        return this.request('/logout', {
            method: 'POST'
        });
    }
}

export const apiServise = new apiServises();