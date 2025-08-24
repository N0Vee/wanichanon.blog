# Wanichanon.blog 🚀

A modern, performant blog built with Next.js 15 and Payload CMS and responsive design.

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TailwindCSS v4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Syntax Highlighter** - Code syntax highlighting

### Backend & CMS
- **Payload CMS** - Headless content management system
- **Vercel Postgres** - Serverless database for content storage
- **Vercel Blob Storage** - File and media storage
- **Node.js** - Runtime environment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm
- Vercel Postgres database
- Vercel Blob storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/N0Vee/wanichanon.blog.git
   cd wanichanon-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Database
   POSTGRES_URL=your-postgres-connection-string
   
   # Payload CMS
   PAYLOAD_SECRET=your-secret-key-here
   
   # Blob Storage
   BLOB_READ_WRITE_TOKEN=your-blob-token-here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## 📁 Project Structure

```
src/
├── app/
│   ├── (frontend)/           # Frontend pages and components
│   │   ├── components/       # Reusable UI components
│   │   ├── post/[id]/       # Blog post pages
│   │   ├── sections/        # Homepage sections
│   │   └── styles.css       # Global styles
│   ├── (payload)/           # Payload CMS admin
│   ├── api/                 # API routes
│   └── utils/               # Utility functions
├── collections/             # Payload CMS collections
│   ├── Media.js            # Media/file uploads
│   ├── Posts.js            # Blog posts
│   └── Users.js            # User authentication
├── payload.config.js        # Payload CMS configuration
└── payload-types.ts         # TypeScript types
```

## 🎨 Features Overview

### Frontend Experience
- **Responsive Design**: Works perfectly on all devices
- **Code Blocks**: Syntax highlighting with copy functionality
- **Table of Contents**: Auto-generated with smooth scrolling

### Admin Panel
- **Content Management**: Easy-to-use admin interface
- **Media Library**: Upload and manage images/files

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Integration Tests
```bash
npm run test:int
```

## 🏗️ Build & Deployment

### Build for Production
```bash
npm run build
npm start
```

### Docker Deployment
```bash
# Build the image
docker build -t wanichanon-blog .

# Run with docker-compose
docker-compose up -d
```

### Environment Variables for Production

```env
# Production Database
POSTGRES_URL=your-production-postgres-url

# Security
PAYLOAD_SECRET=your-production-secret

# Blob Storage
BLOB_READ_WRITE_TOKEN=your-production-blob-token
```

## 📝 Content Management

### Creating Blog Posts

1. Navigate to `/admin` and login
2. Go to **Posts** collection
3. Click **Add New**
4. Fill in:
   - Title and excerpt
   - Content using the rich text editor
   - Tags and categories
   - Featured image
   - SEO metadata


## 🆘 Support

If you have any questions or issues:

- Open an [issue](https://github.com/N0Vee/wanichanon.blog/issues)
- Contact: [wanichanon.work@gmail.com](mailto:wanichanon.work@gmail.com)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Payload CMS](https://payloadcms.com/) - Headless CMS
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

Made with ❤️ by [Wanichanon Sae-Lee](https://github.com/N0Vee)