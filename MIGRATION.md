# Mind Map App - Next.js Migration

This is a complete migration of the Mind Map application from React + Vite + Express.js to a full-stack Next.js application.

## 🎯 Migration Summary

### What was migrated:
- ✅ **Backend API**: Express.js controllers → Next.js API routes
- ✅ **Database**: MongoDB with Mongoose (unchanged)
- ✅ **Authentication**: JWT-based auth system
- ✅ **Frontend Components**: React components with Tailwind CSS
- ✅ **State Management**: Zustand (ready for integration)
- ✅ **TypeScript**: Full TypeScript support
- ✅ **Styling**: Tailwind CSS v4 with custom design system

### Architecture Changes:
- **From**: React (Vite) + Express.js + MongoDB
- **To**: Next.js 15 (App Router) + MongoDB

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
cd nextjs-mind-map
npm install
```

2. **Environment setup:**
Copy `.env.local` and update values:
```bash
MONGODB_URI=mongodb://localhost:27017/mind-map-app
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3001
- API: http://localhost:3001/api

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (replaces Express backend)
│   │   ├── auth/          # Authentication endpoints
│   │   └── mindmaps/      # Mind map CRUD operations
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Auth/              # Authentication components
│   ├── Layout/            # Layout components
│   └── UI/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── auth/              # JWT authentication utilities
│   └── mongodb.ts         # Database connection
├── models/                # Mongoose models
├── services/              # API client and services
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Mind Maps (Protected)
- `GET /api/mindmaps` - Get all mind maps for user
- `POST /api/mindmaps` - Create new mind map
- `GET /api/mindmaps/[id]` - Get specific mind map
- `PUT /api/mindmaps/[id]` - Update mind map
- `DELETE /api/mindmaps/[id]` - Delete mind map

## 🔧 Key Features Implemented

### ✅ Core Features
- [x] User authentication and registration
- [x] JWT-based session management
- [x] Secure password hashing
- [x] MongoDB integration
- [x] TypeScript throughout
- [x] Responsive design with Tailwind CSS
- [x] Error handling and validation

### 🚧 Pending Features (from original)
- [ ] Mind map canvas with Konva.js
- [ ] Drag and drop functionality
- [ ] Real-time collaboration (Socket.io)
- [ ] Mind map import/export
- [ ] Advanced node types and styling
- [ ] Search and filtering
- [ ] Collaboration features

## 🔄 Migration Benefits

1. **Simplified Architecture**: Single codebase instead of separate frontend/backend
2. **Better Performance**: Next.js optimizations (SSR, bundling, etc.)
3. **Improved Developer Experience**: Integrated development environment
4. **Better SEO**: Server-side rendering capabilities
5. **Easier Deployment**: Single deployment target
6. **Type Safety**: End-to-end TypeScript

## 📝 Development Notes

### Current Status
- ✅ Basic authentication flow working
- ✅ API routes responding correctly
- ✅ Database connections established
- ✅ UI components rendered
- 🚧 Mind map functionality needs implementation

### Next Steps
1. Implement mind map canvas components
2. Add Zustand store integration
3. Implement drag & drop with @dnd-kit
4. Add real-time collaboration
5. Implement import/export features

## 🛠 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: App runs on 3001 if 3000 is taken
2. **MongoDB connection**: Ensure MongoDB is running locally
3. **Environment variables**: Check `.env.local` configuration

### Database Setup
```bash
# Start MongoDB locally (if using local installation)
mongod

# Or use MongoDB Atlas cloud connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindmap
```

## 📦 Dependencies

### Core
- Next.js 15 (with Turbopack)
- React 19
- TypeScript 5
- MongoDB & Mongoose
- Tailwind CSS v4

### UI & Interaction
- @headlessui/react
- @dnd-kit/* (drag & drop)
- lucide-react (icons)
- zustand (state management)

### Canvas & Visualization
- konva & react-konva
- reactflow

### Authentication & Security
- jsonwebtoken
- bcryptjs

---

**Migration completed successfully!** 🎉

The application now runs as a unified Next.js application with all the benefits of modern full-stack development.