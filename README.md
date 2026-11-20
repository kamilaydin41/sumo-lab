# SUMO LAB v0.3.0

A browser-based 3D sumo robot design and simulation learning environment.

## Features
- Three.js 3D dohyo and two competing robots
- Front wedge geometry and configurable wedge styles
- WASD / arrow-key manual driving and USB/Bluetooth gamepad support
- Autonomous player mode and autonomous opponent behavior
- Five simulated line sensors per robot (three front, two rear)
- Dohyo edge detection; robots can leave the ring and lose instead of being teleported back
- Robot-to-robot body collision, contact separation, traction-based pushing and blade-facing advantage
- Match result, collision count, push-contact count and telemetry
- Robot classes: Pico 50 g, Micro 100 g, Mini 500 g, 1 kg, Mega 3 kg, Open 5 kg, LEGO and RC profiles
- JavaScript and Arduino C++ starter code, parts catalog, estimated weight and local project save

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

## Vercel
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## Simulation notes
This is an educational, simplified 2D rigid-body approximation rendered in 3D. It includes edge sensors, collision response, traction-based pushing and match outcomes, but it is not a validated engineering-grade physics engine. Preset names and weight limits are common class profiles, not a universal ruleset. Always use the specific event's current technical regulations for official dimensions, weight, dohyo size and start procedure.

The code editor currently provides editable/downloadable JavaScript and Arduino C++ templates; it does not execute arbitrary user code inside the simulation yet.
