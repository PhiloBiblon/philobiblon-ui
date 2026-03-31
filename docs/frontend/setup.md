# Frontend Setup Guide

This guide will help you set up the PhiloBiblon UI frontend for local development.

## Prerequisites

- **Node.js**: v14 or later (v16 recommended)
- **Yarn**: Package manager (v1.22+)
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/PhiloBiblon/philobiblon-ui.git
cd philobiblon-ui/frontend
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all required npm packages defined in `package.json`.

## Configuration

### Environment Variables

The frontend requires the `API_BASE_URL` environment variable to know where the backend API is located.

**For remote backend:**
```bash
export API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-fg/
```

**For local backend:**
```bash
export API_BASE_URL=http://localhost:8080/
```

### Nuxt Configuration

The main configuration file is `nuxt.config.js`. Key settings:

- **mode**: `'spa'` - Client-side rendering only
- **target**: `'server'` - Build target
- **axios**: Base URL configured from `API_BASE_URL`
- **vuetify**: Material Design theme configuration

## Running the Development Server

```bash
yarn dev
```

Or with the environment variable inline:

```bash
export API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-fg/ && yarn dev
```

The application will be available at `http://localhost:3000`.

### Development Features

- **Hot Module Replacement (HMR)**: Changes to `.vue` files automatically reload
- **ESLint**: Code quality checks run on save
- **Source Maps**: For debugging in browser DevTools

## Building for Production

### Generate Static Files

```bash
yarn generate
```

This creates a `dist/` directory with static HTML/JS/CSS files.

### Build for Server Deployment

```bash
yarn build
yarn start
```

This creates an optimized production build and starts the Nuxt server.

## Common Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn generate` | Generate static site |
| `yarn lint` | Run ESLint |
| `yarn lint --fix` | Auto-fix ESLint errors |

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 yarn dev
```

### Module Not Found Errors

Clear the Nuxt cache and reinstall:

```bash
rm -rf node_modules .nuxt
yarn install
```

### API Connection Issues

Verify that:
1. `API_BASE_URL` is set correctly
2. The backend is running and accessible
3. CORS is properly configured on the backend

Check the browser console for detailed error messages.

## Next Steps

- Read the [Architecture Guide](architecture.md) to understand the project structure
- Review [State Management](state-management.md) to learn about Vuex stores
- Explore [Components](components.md) for UI component patterns
