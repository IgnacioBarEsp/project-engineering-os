Main f389335 includes #78 via PR #84, with 14 Companion tests, 286 core tests and all required CI jobs passing.
The prototype is simulated; there is no Electron main/preload/renderer, native picker or project history yet.
The constructor rejects pre-existing project-owned seed files; adoption must preserve ownership explicitly.
