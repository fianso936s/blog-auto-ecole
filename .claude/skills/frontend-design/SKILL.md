---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with bold aesthetic choices. Use when building or redesigning web components, pages, or UI for the blog auto-ecole project.
user-invocable: true
disable-model-invocation: false
argument-hint: "[description of the component/page to create or redesign]"
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user wants to create or redesign: $ARGUMENTS

## Project Context

This is a React + TypeScript + Tailwind CSS project (blog auto-ecole). Use the existing tech stack:
- **Framework**: React with react-router-dom
- **Styling**: Tailwind CSS (utility classes)
- **Icons**: Lucide React
- **Auth**: Supabase
- **Build**: Vite

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font. Use Google Fonts imports when needed.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables or Tailwind config for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. The current project uses `#cf5c36` as primary and `#fcfaf8` as background - you may evolve this palette or propose a bolder one.
- **Motion**: Use CSS animations and transitions for effects and micro-interactions. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, and grain overlays.

## What to NEVER Do

NEVER use generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Cliched color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations.

## Implementation Steps

1. **Analyze** the request and the existing codebase structure
2. **Propose** an aesthetic direction (briefly explain the vision to the user)
3. **Implement** the code using the project's tech stack (React + Tailwind)
4. **Refine** every detail: spacing, colors, transitions, hover states, responsiveness
5. **Verify** the build compiles without errors

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
