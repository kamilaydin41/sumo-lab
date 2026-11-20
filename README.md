# SUMO LAB v0.4.0

3B sumo robot simulation and education environment built with React, Vite and Three.js.

## Features
- 3D dohyo and two-robot training simulation
- Manual RC control with two on-screen virtual sticks (throttle + steering)
- Keyboard control (WASD / arrow keys)
- USB/Bluetooth gamepad support through the browser Gamepad API
- Autonomous opponent-seeking and edge-avoidance mode
- Five simulated line sensors per robot
- Robot classes, front wedge variants, component selection and weight estimate
- JavaScript and Arduino C++ starter code panels

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

## Controls
- RC / Manual: left virtual stick = forward/reverse; right virtual stick = steering.
- Keyboard: W/S = forward/reverse; A/D = rotate.
- Gamepad: left stick Y = throttle; left stick X = steering. Connect before opening the page or press a button to wake some controllers.
- Autonomous: robot searches for the opponent, approaches and attacks while prioritizing line-edge avoidance.

Note: the simulation is an educational approximation, not a validated competition-grade rigid-body solver. Actual robot physics and official weight/dohyo rules vary by event.
