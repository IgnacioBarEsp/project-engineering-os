Companion 0.1.0 runs only from a repository checkout: `npm ci`, an explicit Electron runtime download
and `npm start`. #87 left verified managed runtimes in `%LOCALAPPDATA%\Project Engineering OS\runtimes`,
local project history in the app's user-data directory, and prepared state inside each project folder.
The repository publishes only the npm core package; there is no application artifact, no checksum for
one, and no code-signing certificate. `apps/companion` has 56 automated tests and five browser journeys.
