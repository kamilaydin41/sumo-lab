# Updating SUMO LAB on Vercel — v0.4.0

1. Extract `sumo-lab-v0.4.0.zip`.
2. Replace the contents of the existing GitHub `sumo-lab` repository with the extracted project contents. Keep `package.json` at repository root.
3. Commit with message: `SUMO LAB v0.4.0 - RC and Autonomous Controls`.
4. Push to the branch connected to Vercel.
5. Vercel should automatically build and deploy. Build command: `npm run build`; output directory: `dist`.

If deployment fails, open the Vercel deployment log and check the first build error. Run `npm install` and `npm run build` locally before retrying.
