# Desktop shell

This shell uses the same pages, service planner and document imports as the web app. From the parent project root, run `npm ci` and `npm run build`, then inside this directory run `npm install` and `npm start`.

The build creates app/. Source for the interface lives in ../web/. See the parent README for features, imports, saving and validation limits. The Electron runtime still needs testing on the target computer before use in a live service.
