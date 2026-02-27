// Simple in-memory database (for production, consider using a real database)
let database = {
    users: [],
    forumThreads: [],
    chatMessages: [],
    userTickets: [],
    friends: [],
    friendRequests: [],
    privateMessages: [],
    adminSettings: {
        chatCooldown: 30,
        threadCooldown: 60,
        lockdownChat: false,
        lockdownThreads: false
    },
    bannedUsers: []
};

// Initialize with sample data if empty
function initializeSampleData() {
    if (database.users.length === 0) {
        database.users = [
            {
                id: 1,
                username: "Owner",
                email: "owner@valandwaffen.com",
                password: "admin123",
                role: "Owner",
                level: 10,
                xp: 1000,
                badges: ["Owner"],
                profilePicture: null,
                profileBanner: null,
                createdAt: new Date().toISOString()
            }
        ];
    }
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { type, data } = req.query;
        const body = req.body;

        // Initialize sample data if needed
        initializeSampleData();

        switch (req.method) {
            case 'GET':
                if (type === 'users') {
                    res.status(200).json(database.users);
                } else if (type === 'forumThreads') {
                    res.status(200).json(database.forumThreads);
                } else if (type === 'chatMessages') {
                    res.status(200).json(database.chatMessages);
                } else if (type === 'userTickets') {
                    res.status(200).json(database.userTickets);
                } else if (type === 'adminSettings') {
                    res.status(200).json(database.adminSettings);
                } else {
                    res.status(200).json(database);
                }
                break;

            case 'POST':
                if (type === 'users') {
                    const newUser = { ...body, id: Date.now(), createdAt: new Date().toISOString() };
                    database.users.push(newUser);
                    res.status(201).json(newUser);
                } else if (type === 'forumThreads') {
                    const newThread = { ...body, id: Date.now(), createdAt: new Date().toISOString() };
                    database.forumThreads.push(newThread);
                    res.status(201).json(newThread);
                } else if (type === 'chatMessages') {
                    const newMessage = { ...body, id: Date.now(), timestamp: new Date().toISOString() };
                    database.chatMessages.push(newMessage);
                    res.status(201).json(newMessage);
                } else if (type === 'userTickets') {
                    const newTicket = { ...body, id: Date.now(), createdAt: new Date().toISOString() };
                    database.userTickets.push(newTicket);
                    res.status(201).json(newTicket);
                } else if (type === 'adminSettings') {
                    database.adminSettings = { ...database.adminSettings, ...body };
                    res.status(200).json(database.adminSettings);
                } else {
                    res.status(400).json({ error: 'Invalid type for POST' });
                }
                break;

            case 'PUT':
                if (type === 'users' && body.id) {
                    const userIndex = database.users.findIndex(u => u.id === body.id);
                    if (userIndex !== -1) {
                        database.users[userIndex] = { ...database.users[userIndex], ...body };
                        res.status(200).json(database.users[userIndex]);
                    } else {
                        res.status(404).json({ error: 'User not found' });
                    }
                } else if (type === 'forumThreads' && body.id) {
                    const threadIndex = database.forumThreads.findIndex(t => t.id === body.id);
                    if (threadIndex !== -1) {
                        database.forumThreads[threadIndex] = { ...database.forumThreads[threadIndex], ...body };
                        res.status(200).json(database.forumThreads[threadIndex]);
                    } else {
                        res.status(404).json({ error: 'Thread not found' });
                    }
                } else if (type === 'userTickets' && body.id) {
                    const ticketIndex = database.userTickets.findIndex(t => t.id === body.id);
                    if (ticketIndex !== -1) {
                        database.userTickets[ticketIndex] = { ...database.userTickets[ticketIndex], ...body };
                        res.status(200).json(database.userTickets[ticketIndex]);
                    } else {
                        res.status(404).json({ error: 'Ticket not found' });
                    }
                } else {
                    res.status(400).json({ error: 'Invalid type or missing ID for PUT' });
                }
                break;

            case 'DELETE':
                if (type === 'forumThreads' && body.id) {
                    const threadIndex = database.forumThreads.findIndex(t => t.id === body.id);
                    if (threadIndex !== -1) {
                        database.forumThreads.splice(threadIndex, 1);
                        res.status(200).json({ success: true });
                    } else {
                        res.status(404).json({ error: 'Thread not found' });
                    }
                } else if (type === 'userTickets' && body.id) {
                    const ticketIndex = database.userTickets.findIndex(t => t.id === body.id);
                    if (ticketIndex !== -1) {
                        database.userTickets.splice(ticketIndex, 1);
                        res.status(200).json({ success: true });
                    } else {
                        res.status(404).json({ error: 'Ticket not found' });
                    }
                } else {
                    res.status(400).json({ error: 'Invalid type or missing ID for DELETE' });
                }
                break;

            default:
                res.status(405).json({ error: 'Method not allowed' });
                break;
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
