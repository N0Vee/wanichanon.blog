# Copilot Instructions for Wanichanon.blog

## Overview
Wanichanon.blog is a modern blog platform built with **Next.js**, **Payload CMS**, **TailwindCSS**, and **Framer Motion**. It features dynamic content, responsive design, and a user-friendly admin panel for content management.

---

## Architecture

### Key Components
- **Frontend** (`src/app/(frontend)`):
  - Contains pages, reusable components, and sections for the blog.
  - Implements animations using **Framer Motion**.
  - Styled with **TailwindCSS**.
- **Backend** (`src/app/(payload)`):
  - Powered by **Payload CMS** for content management.
  - Includes admin panel and API routes.
- **API** (`src/app/api`):
  - Handles dynamic routes for fetching posts, categories, and other data.
- **Collections** (`src/collections`):
  - Defines Payload CMS collections for `Posts`, `Media`, and `Users`.
- **Utilities** (`src/app/utils`):
  - Contains helper functions for formatting dates, author names, etc.

### Data Flow
1. **Content Creation**: Admins create posts via the Payload CMS admin panel.
2. **Data Fetching**: The frontend fetches posts and categories via API routes.
3. **Rendering**: Articles are rendered dynamically with animations and responsive layouts.

---

## Developer Workflows

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/N0Vee/wanichanon.blog.git
   cd wanichanon-blog
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Testing
- **Unit Tests**:
  ```bash
  npm run test
  ```
- **E2E Tests**:
  ```bash
  npm run test:e2e
  ```
- **Integration Tests**:
  ```bash
  npm run test:int
  ```

### Production Build
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

### Docker Deployment
1. Build the Docker image:
   ```bash
   docker build -t wanichanon-blog .
   ```
2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

---

## Project-Specific Conventions

### File Naming
- Use `camelCase` for filenames (e.g., `authorUtils.js`).
- Group related components in folders (e.g., `sections/` for homepage sections).

### Styling
- Use **TailwindCSS** for all styling.
- Follow the utility-first approach for consistent design.

### Animations
- Use **Framer Motion** for animations.
- Define `variants` for reusable animation patterns.

### API Integration
- Use `fetch` for API calls.
- Base URL is dynamically set using:
  ```js
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || window.location.origin;
  ```

---

## Integration Points

### Payload CMS
- Admin panel: `/admin`
- Collections:
  - `Posts`: Blog posts with fields for title, content, tags, etc.
  - `Media`: File uploads for images and videos.
  - `Users`: Authentication and roles.

### External Services
- **Vercel Postgres**: Database for storing content.
- **Vercel Blob Storage**: Media storage for images and files.

---

## Examples

### Adding a New Section
1. Create a new file in `src/app/(frontend)/sections/`.
2. Export a React component with the section logic.
3. Import and use the section in the homepage layout.

### Fetching Posts
Example API call to fetch posts:
```js
const fetchPosts = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || window.location.origin;
  const res = await fetch(`${baseUrl}/api/posts`);
  const data = await res.json();
  return data.docs;
};
```

---

For further questions, refer to the [README.md](../README.md) or open an issue in the repository.
