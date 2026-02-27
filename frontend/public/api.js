// API Service for multiplayer functionality
class ApiService {
    constructor() {
        this.baseUrl = window.location.origin + '/api';
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Users
    async getUsers() {
        return this.request('/data?type=users');
    }

    async createUser(userData) {
        return this.request('/data?type=users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userData) {
        return this.request('/data?type=users', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Forum Threads
    async getForumThreads() {
        return this.request('/data?type=forumThreads');
    }

    async createThread(threadData) {
        return this.request('/data?type=forumThreads', {
            method: 'POST',
            body: JSON.stringify(threadData)
        });
    }

    async updateThread(threadData) {
        return this.request('/data?type=forumThreads', {
            method: 'PUT',
            body: JSON.stringify(threadData)
        });
    }

    async deleteThread(threadId) {
        return this.request('/data?type=forumThreads', {
            method: 'DELETE',
            body: JSON.stringify({ id: threadId })
        });
    }

    // Chat Messages
    async getChatMessages() {
        return this.request('/data?type=chatMessages');
    }

    async sendMessage(messageData) {
        return this.request('/data?type=chatMessages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    // User Tickets
    async getUserTickets() {
        return this.request('/data?type=userTickets');
    }

    async createTicket(ticketData) {
        return this.request('/data?type=userTickets', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    }

    async updateTicket(ticketData) {
        return this.request('/data?type=userTickets', {
            method: 'PUT',
            body: JSON.stringify(ticketData)
        });
    }

    async deleteTicket(ticketId) {
        return this.request('/data?type=userTickets', {
            method: 'DELETE',
            body: JSON.stringify({ id: ticketId })
        });
    }

    // Admin Settings
    async getAdminSettings() {
        return this.request('/data?type=adminSettings');
    }

    async updateAdminSettings(settings) {
        return this.request('/data?type=adminSettings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    }

    // Get all data (for initial load)
    async getAllData() {
        return this.request('/data');
    }
}

// Global API service instance
window.apiService = new ApiService();
