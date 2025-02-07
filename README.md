# Calshots

A simple calendar screenshot generator for sharing project timelines and roadmaps.

## Overview

Calshots lets you quickly create and share calendar views. Add events, customize the look, and export as an image.

## Key Features

- Month view calendar
- Drag & drop events
- Quick event creation
- Customizable backgrounds and styling
- Export to PNG
- Copy to clipboard

## File Structure
```
src/
├── app/ # Next.js app router
├── components/
│ ├── Calendar.tsx # Main calendar wrapper
│ ├── CalendarGrid.tsx # Calendar grid and events
│ ├── EventDialog.tsx # Event creation/edit modal
│ ├── MonthSelector.tsx # Month navigation
│ └── Toolbar.tsx # Settings and actions
├── context/
│ └── CalendarContext.tsx # Global state management
├── types/
│ └── index.ts # TypeScript types
└── utils/
└── colors.ts # Color generation utilities
```

## To Do

### Design Polish
- [ ] Improve event styles
- [ ] Add hover states
- [ ] Refine spacing and typography
- [ ] Add loading states
- [ ] Improve mobile layout

### Dark Mode
- [ ] Add theme toggle
- [ ] Create dark color palette
- [ ] Handle background colors in dark mode
- [ ] Persist theme preference

### Enhanced Screenshots
- [ ] Add template options
- [ ] Support custom dimensions
- [ ] Add watermark options
- [ ] Improve export quality
- [ ] Add more background styles

