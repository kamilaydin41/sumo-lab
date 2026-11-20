# SUMO LAB — v0.2.0

Turkish-language mini-sumo robot design and 3D simulation workspace. Built with React, Vite and Three.js.

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

## Deploy / update on Vercel
1. Push the contents of this project to the connected GitHub repository (replace the previous project files).
2. Vercel automatically starts a new deployment when the connected branch receives a commit.
3. Build command: `npm run build`; output directory: `dist`.

No environment variables are required.

## v0.2.0 features
- Responsive Turkish interface
- Three.js 3D mini-sumo dohyo and two robot models
- Manual WASD / arrow-key control
- Autonomous chase mode and rival pursuit behavior
- Speed control, reset, distance and collision telemetry
- Robot identity, class and body color settings
- Component selection with estimated weight budget
- Local project persistence in browser localStorage
- Editable JavaScript and Arduino C++ code templates
- Copy code and download `.js` / `.ino` source files

## Current limitations
- Physics and collision handling are educational approximations, not competition-grade dynamics.
- Component placement is a selection/weight estimator; a full drag-and-drop CAD editor is not included yet.
- The code panel edits and exports code but does not execute user code in the simulator.
- ESP32 / physical robot connectivity, persistent cloud projects, accounts and multiplayer are not included.
