# Raise the supported Node.js baseline — #155

The core and generated consumer will support maintained Node LTS lines only: `^22.22.0 || ^24.18.0`, with Node 24 recommended. Node 20 is EOL and will be rejected with a clear recovery message. CI keeps the six-job OS/runtime matrix by replacing Node 20 with Node 24.x; active docs and the seed adopt an explicit LTS/EOL review policy. This is an incompatible runtime-policy change and ships as major 1.0.0. Companion's app runtime and package-manager policy do not change; Node 26 remains excluded until it is LTS and reviewed.
