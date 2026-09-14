---
version: 1.0.0
format: spec
brand_name: GeM Compliance Dashboard
---

# Design System: The 15-Style Showcase

This document serves as the single source of truth for the frontend redesign, adhering to the principles outlined in the Garry Tan `design-consultation` skill. We are building a **Multi-Theme Engine (Option A)** that seamlessly transitions between 15 distinct UI aesthetics.

## Design Philosophy (Garry Tan Voice)
- **Concrete & Direct**: This isn't just a color palette swap. Each theme fundamentally changes the spatial relationship, borders, and shadows of the UI.
- **Outcomes over Features**: The user experiences 15 different ways to view compliance data. We use CSS variables and Tailwind utility classes to ensure performance doesn't degrade.
- **Boil the Ocean**: We are fully supporting all 15 themes (Minimalism, Maximalism, Glassmorphism, Neumorphism, Claymorphism, Brutalism, Neo-Brutalism, Skeuomorphism, Flat Design, Material Design, Bento UI, Y2K Design, Retro Design, Cyberpunk, Editorial Design). No shortcuts.

## The Polymorphic Architecture
Instead of 15 different component files for a Button, we will have **one** `<Button>` component that reads the current theme from a React Context and applies the corresponding Tailwind classes.

### Theme CSS Variables Mapping
We will define data-attributes in `index.css`:
```css
:root { /* Default: Minimalism */
  --bg-primary: #ffffff;
  --text-primary: #111827;
  --border-radius: 4px;
  --box-shadow: none;
}

[data-theme="brutalism"] {
  --bg-primary: #ff0000;
  --text-primary: #000000;
  --border-radius: 0px;
  --box-shadow: 8px 8px 0px #000000;
  --border-thickness: 4px;
}

[data-theme="glassmorphism"] {
  --bg-primary: rgba(255, 255, 255, 0.1);
  --backdrop-filter: blur(10px);
}
/* ... expanded for all 15 themes */
```

## Implementation Steps
1. Define the 15 `[data-theme="..."]` blocks in `src/index.css`.
2. Create `src/contexts/ThemeContext.tsx` to handle state.
3. Update `src/components/ui` to be theme-aware.
4. Integrate the Theme Switcher into the Top Navigation.
