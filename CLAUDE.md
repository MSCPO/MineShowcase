# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MineShowcase is a Nuxt.js web application that serves as a frontend for the MSCPO/ServerAPI backend. It showcases Minecraft servers and provides a platform for server discovery, promotion, and community interaction.

## Tech Stack

- **Framework**: Nuxt.js 3.x (Vue 3.x)
- **UI Library**: Ant Design Vue 4.x
- **State Management**: Pinia 3.x
- **HTTP Client**: alova
- **Styling**: LESS with CSS variables
- **Internationalization**: Custom TOML-based i18n setup

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (localhost:3000)
pnpm dev

# Build for production
pnpm build

# Generate static site
pnpm generate

# Preview production build
pnpm preview

# Code formatting
pnpm prettier:check  # Check formatting issues
pnpm prettier:fix    # Fix formatting issues
```

## Project Architecture

### API Structure

The API integration is organized in the `/api` directory:
- `methods/ServerAPI.ts` - Main server API client
- `methods/Token.ts` - Authentication API client
- `methods/fetch_status.ts` - Server status checking
- `models.ts` - TypeScript interfaces for API models

### Component Organization

Components are organized by feature in the `/components` directory:
- Common reusable components in `/components/Common`
- Feature-specific components in dedicated directories (ServerList, UserPanel, etc.)
- Layout components in `/layouts` directory

### Internationalization

Language support is implemented in the `/languages` directory:
- TOML-based translation files (en_US.toml, zh_CN.toml)
- TypeScript interfaces for type safety

### Pages

The application routes are defined in the `/pages` directory following Nuxt.js file-based routing conventions:
- Dynamic routes use bracket notation (e.g., `/details/[id].vue`)
- Authentication pages in `/auth`
- User profiles in `/user/[UUID].vue`

## Build and Deployment

The application is configured for:
- SSR (Server-Side Rendering)
- Static site generation
- Performance optimization (gzip/brotli compression, code splitting)
- PWA capabilities

Deploy configuration is specified in `vercel.json` for Vercel hosting.