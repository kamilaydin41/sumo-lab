# SUMO LAB — v0.1.0

Mini sumo robot design and simulation starter project. Built with React, Vite and Three.js.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Deploy to Vercel
1. Push this project to a GitHub repository.
2. In Vercel choose **Add New → Project** and import the repository.
3. Framework preset: **Vite** (usually detected automatically).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

No environment variables are required for this starter.

## Current scope
- Responsive Turkish UI
- Three.js 3D dohyo and two simple robot models
- Manual keyboard driving (WASD / arrow keys)
- Basic autonomous chase mode
- Speed control, reset, telemetry display
- JavaScript and Arduino C++ starter code views
- Component library preview

The code editor is currently a starter-code viewer; user code execution, real robot physics, sensors, robot assembly, saving projects and ESP32 connectivity are planned for later phases.
