# ValandWaffen - Elite Community Platform

A modern, full-stack web application featuring a Reddit-style forum, live chat, and recruitment ticket system built with security and scalability in mind.

## 🌟 Features

### 🔐 Authentication & Security
- Secure JWT-based authentication
- Role-based permissions (User, Official Member, Co-Leader, Leader, Admin)
- Password hashing with bcrypt
- Protected API endpoints
- Input validation and sanitization

### 👥 User System
- User profiles with customizable avatars and banners
- XP and leveling system
- Badge system for role recognition
- Automatic admin assignment for `northlable69@gmail.com`

### 💬 Forum System
- Category-based discussions
- Thread creation and management
- Reply system with likes
- Pin and lock functionality
- Admin moderation tools

### 💭 Live Chat
- Real-time messaging with Socket.IO
- Global chat room
- Message history
- Admin moderation capabilities

### 🎫 Recruitment Tickets
- Private ticket system
- Real-time ticket conversations
- Admin-only access management
- Status tracking (open, in-progress, closed)
- Ticket assignment system

## � Quick Deploy to Production

### 🎯 Option 1: One-Click Deployment (Recommended)

**Frontend (Vercel):**
1. Push code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Set root directory: `frontend`
4. Add `NEXT_PUBLIC_API_URL` environment variable

**Backend (Railway):**
1. Import to [Railway](https://railway.app)
2. Set root directory: `backend`
3. Add environment variables (see below)
4. Deploy!

### 📋 Option 2: Manual Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## �🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Helmet** for security headers

### Frontend
- **Next.js** 14 with React 18
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Socket.IO Client** for real-time updates
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

## � Environment Variables

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Backend (Railway/Render)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/valandwaffen
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=5000
```

## 📁 Project Structure

```
valandwaffensite/
├── backend/
│   ├── middleware/          # Authentication and security middleware
│   ├── models/             # MongoDB models (User, Forum, Chat, Tickets)
│   ├── routes/             # API routes
│   ├── uploads/            # File upload directory
│   ├── .env.example        # Environment variables template
│   ├── railway.json        # Railway deployment config
│   ├── render.yaml         # Render deployment config
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
├── frontend/
│   ├── components/         # React components
│   ├── contexts/           # React contexts (Auth, Socket)
│   ├── pages/              # Next.js pages
│   ├── styles/             # CSS and Tailwind configuration
│   ├── .env.example        # Frontend environment template
│   ├── package.json        # Frontend dependencies
│   └── next.config.js      # Next.js configuration
├── icons/                  # Site icons and logos
├── vercel.json             # Vercel deployment config
├── DEPLOYMENT.md           # Detailed deployment guide
├── package.json            # Root package.json with scripts
└── README.md               # This file
```

## 🎯 Deployment Platforms

### ✅ Tested Platforms
- **Vercel** (Frontend) ⭐ Recommended
- **Railway** (Backend) ⭐ Recommended  
- **Render** (Backend)
- **MongoDB Atlas** (Database)

### 🔧 Available Scripts

#### Root Level
- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend server
- `npm run build` - Build the frontend for production

#### Backend
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend in production

#### Frontend  
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server

## 👤 Default Admin Account

The following email automatically receives Admin privileges when registering:
- **Email**: `northlable69@gmail.com`
- **Role**: Admin

## 🎯 Role Hierarchy

1. **Admin** - Full system access
2. **Leader** - Can manage users and content
3. **Co-Leader** - Can moderate forums and tickets
4. **Official Member** - Enhanced privileges
5. **User** - Default role

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt (12 rounds)
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Security headers with Helmet
- File upload restrictions
- SQL injection prevention (MongoDB)
- XSS protection
- CSRF protection

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile-picture` - Upload profile picture
- `POST /api/users/profile-banner` - Upload profile banner
- `PUT /api/users/:id/badges` - Manage user badges (Admin+)

### Forum
- `GET /api/forum/categories` - Get forum categories
- `POST /api/forum/categories` - Create category (Admin)
- `GET /api/forum/categories/:categoryId/threads` - Get category threads
- `POST /api/forum/threads` - Create thread
- `GET /api/forum/threads/:id` - Get thread with replies
- `POST /api/forum/threads/:id/replies` - Create reply
- `POST /api/forum/replies/:id/like` - Like/unlike reply

### Chat
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/messages` - Send message
- `DELETE /api/chat/messages/:id` - Delete message (Admin)

### Tickets
- `GET /api/tickets/my-tickets` - Get user's tickets
- `GET /api/tickets/` - Get all tickets (Admin+)
- `POST /api/tickets/` - Create ticket
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets/:id/messages` - Add message to ticket

## � Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Git for cloning

### Local Development
1. Clone and install dependencies:
   ```bash
   git clone <repository-url>
   cd valandwaffensite
   npm run install-all
   ```

2. Set up environment:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start development servers:
   ```bash
   cd ..
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🆘 Support

If you encounter deployment issues:

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
2. Verify environment variables are set correctly
3. Check platform-specific logs (Vercel, Railway, etc.)
4. Ensure MongoDB connection is working
5. Test API endpoints directly

## � License

This project is licensed under the MIT License.

---

**Built with ❤️ for the ValandWaffen community | Ready for Production Deployment**
