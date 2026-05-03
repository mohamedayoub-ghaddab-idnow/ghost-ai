# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete

## Current Goal

- None — authentication implementation complete

## Completed

- Installed and configured shadcn/ui dependencies (clsx, tailwind-merge, class-variance-authority, lucide-react, @radix-ui packages)
- Created lib/utils.ts with cn() helper for merging Tailwind classes
- Added CSS custom properties to globals.css with @theme inline mapping for Tailwind tokens
- Added shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- All components use dark theme tokens from globals.css (bg-surface, bg-elevated, text-primary, border-default, accent-primary, etc.)
- Build passes with no TypeScript errors
- Editor navbar component with sidebar toggle (PanelLeftOpen/PanelLeftClose icons)
- Project sidebar component with sliding animation, backdrop, tabs (My Projects/Shared), empty states, and New Project button
- Created components/editor directory for editor-specific components
- Installed @clerk/ui package
- Wrapped root layout with ClerkProvider using Clerk's dark theme
- Created proxy.ts at project root for route protection with object-based matcher config
- Created sign-in page with two-panel layout (feature list left, Clerk form right)
- Created sign-up page with two-panel layout matching sign-in
- Root page redirects authenticated users to /editor, unauthenticated to /sign-in
- Added UserButton to editor navbar right section with dark theme styling
- Created basic editor page with navbar and sidebar integration

## In Progress

- None

## Next Up

- Canvas implementation with React Flow
- Project management features
- Liveblocks integration for real-time collaboration

## Open Questions

- None

## Architecture Decisions

- Using shadcn/ui pattern with Radix UI primitives for accessibility
- Components use CSS custom properties defined in globals.css mapped to Tailwind via @theme inline
- No light mode — dark theme only as per ui-context.md
- Border radius scale: rounded-xl for small elements, rounded-2xl for cards, rounded-3xl for modals
- Editor chrome: fixed-height navbar (h-14), floating sidebar overlay (w-72) that slides in from left
- Sidebar uses backdrop blur and rounded-r-2xl for polished dark theme appearance
- Empty states use 8x8 icon containers with rounded-2xl
- Auth pages: two-panel layout on large screens, form-only on small screens, no gradients or oversized heroes
- Route protection via proxy.ts with object-based matcher config (Next.js 16 compatible)
- Clerk components styled with CSS variable tokens, no hardcoded colors
- Proxy uses named export `proxy` per Next.js 16 convention (clerkMiddleware assigned to variable)

## Session Notes

- This version of Next.js (16.2.4) uses Tailwind v4 with @tailwindcss/postcss
- The @theme inline directive in globals.css maps CSS variables to Tailwind utility names
- All shadcn components were created manually to ensure dark theme styling matches the design system
- Dialog component already ready for future use with title, description, and footer actions support
- Clerk already installed and connected via @clerk/nextjs package
- Environment variables for Clerk keys already present in .env.local
- Next.js 16 proxy expects named export `proxy` or default export, not `middleware`
- Next.js 16 proxy config with string-based regex matchers causes "Invalid segment configuration" error
- Object-based matcher config (with `source` property) works correctly in Next.js 16 proxy
