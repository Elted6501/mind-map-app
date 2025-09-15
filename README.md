# 🧠 Next.js Mind Map Application

A powerful, feature-rich mind mapping application built with Next.js 15, featuring real-time collaboration, cloud storage, and advanced visualization capabilities.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)

## ✨ Features

### 🎯 Core Features
- **Interactive Mind Mapping**: Create, edit, and organize nodes with intuitive drag-and-drop
- **Visual Connections**: Connect ideas with customizable lines and relationships
- **Cloud Storage**: Automatic sync with MongoDB Atlas + localStorage fallback
- **Mobile Responsive**: Touch-optimized interface for tablets and smartphones
- **Real-time Editing**: Live updates as you create and modify your mind maps

### 🚀 Advanced Features
- **User Authentication**: Secure JWT-based registration and login system
- **Import/Export**: Support for CSV, JSON formats with comprehensive validation
- **Template Library**: Pre-built templates for quick project starts
- **Global Search**: Find content across all your mind maps instantly
- **Collaboration**: Share mind maps and manage collaborators (API ready)
- **Advanced Styling**: Customizable node colors, shapes, fonts, and connections

### 🎨 User Experience
- **Canvas Controls**: Zoom, pan, grid system, and minimap navigation
- **Keyboard Shortcuts**: Efficient workflow with keyboard navigation
- **Undo/Redo**: Version tracking for safe experimentation
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Welcome Flow**: Guided onboarding for new users

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **UI Library**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS 3.4.17
- **Canvas**: React Konva for high-performance 2D rendering
- **State Management**: Zustand 5.0.8
- **UI Components**: Headless UI, Lucide React icons
- **Drag & Drop**: @dnd-kit for smooth interactions

### Backend
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs hashing
- **API**: RESTful endpoints with Next.js API routes
- **File Processing**: Server-side import/export handling

### Development
- **Language**: TypeScript for type safety
- **Linting**: ESLint with Next.js configuration
- **Build Tools**: PostCSS, Autoprefixer
- **Package Manager**: npm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Elted6501/mind-map-app.git
cd nextjs-mind-map
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── mindmaps/      # Mind map CRUD operations
│   │   └── collaboration/ # Collaboration features
│   └── import-guide/      # Import documentation
├── components/            # React components
│   ├── Auth/             # Authentication forms
│   ├── Canvas/           # Mind map canvas and nodes
│   ├── Import/           # Import functionality
│   ├── Layout/           # App layout components
│   ├── Search/           # Search and filtering
│   ├── Templates/        # Template browser
│   └── UI/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── models/               # Database models
├── services/             # API and business logic
├── store/                # State management
├── types/                # TypeScript definitions
└── utils/                # Helper functions
```

## 🎮 Usage Guide

### Creating Your First Mind Map
1. **Sign up** or use as guest
2. **Double-click** on canvas to create root node
3. **Double-click** nodes to edit text
4. **Drag** from blue connection handles to link nodes
5. **Use toolbar** for styling and export options

### Importing Existing Data
1. Click **Import** button in the toolbar
2. Choose **CSV** or **JSON** file format
3. Follow the [Import Guide](./src/app/import-guide/page.tsx) for format specifications
4. Drag and drop your file or browse to select

### Keyboard Shortcuts
- `Double-click`: Create/edit nodes
- `Delete/Backspace`: Remove selected nodes
- `Escape`: Cancel current action
- `Space + Drag`: Pan canvas
- `Scroll`: Zoom in/out

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user profile

### Mind Maps
- `GET /api/mindmaps` - List user's mind maps
- `POST /api/mindmaps` - Create new mind map
- `GET /api/mindmaps/[id]` - Get specific mind map
- `PUT /api/mindmaps/[id]` - Update mind map
- `DELETE /api/mindmaps/[id]` - Delete mind map

### Import/Export
- `GET /api/mindmaps/[id]/export/[format]` - Export (JSON, SVG)
- `POST /api/mindmaps/import` - Import from file

### Search
- `GET /api/mindmaps/search?q={query}` - Search across mind maps

### Collaboration
- `GET /api/collaboration/[id]/collaborators` - List collaborators
- `POST /api/collaboration/[id]/collaborators` - Add collaborator
- `DELETE /api/collaboration/[id]/collaborators/[userId]` - Remove collaborator

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

### Database Setup
1. Create MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Add to `.env.local`

### Adding New Features
1. Create components in appropriate `/src/components/` directory
2. Add API routes in `/src/app/api/`
3. Update TypeScript types in `/src/types/`
4. Test with both authenticated and guest users

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the excellent React framework
- [React Konva](https://konvajs.org/docs/react/) for canvas rendering
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [MongoDB](https://www.mongodb.com/) for cloud database services
- [Vercel](https://vercel.com/) for seamless deployment

## 📞 Support

- **Documentation**: Check the `/src/app/import-guide/` for detailed usage instructions
- **Issues**: Create an issue in this repository
- **Email**: Contact the development team

---

**Built with ❤️ using Next.js and modern web technologies**
