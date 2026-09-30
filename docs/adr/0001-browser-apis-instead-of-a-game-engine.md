# Browser APIs instead of a game engine

Pac Mano is a small grid-based game with geometric artwork and three authored mazes. We chose TypeScript, Canvas 2D, HTML menus, and Vite over a game engine to keep the rules inspectable and independently testable. This trades engine-provided scene, input, and audio utilities for fewer runtime dependencies and direct control of browser integration.
