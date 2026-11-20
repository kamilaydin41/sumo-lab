# Deploy SUMO LAB v0.3.0 to Vercel

1. Extract this ZIP archive.
2. Open the existing GitHub repository `sumo-lab`.
3. Replace the repository files with the contents of this folder. Keep `package.json`, `index.html`, `.gitignore`, and the complete `src` folder at repository root.
4. Commit with message: `SUMO LAB v0.3.0 - sumo pushing and line sensors`.
5. Push to the branch connected to Vercel. Vercel should start a new deployment automatically.

Vercel settings:
- Framework: Vite
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`

After deployment, test both robots, line sensors, manual drive, autonomous mode, contact pushing and winner detection. This release has passed source syntax transpilation checks; package installation/build could not be completed in the authoring environment because npm registry access timed out.
