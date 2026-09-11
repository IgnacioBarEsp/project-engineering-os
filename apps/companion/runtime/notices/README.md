# Runtime sources and notices

The private Companion app includes npm 11.19.1 under Artistic-2.0 with its complete bundled dependency
notices. Its MIT core and the isolated OpenSpec 1.6.0 toolchain remain separately pinned in their locks.
The app itself remains MIT. The universal CLI package does not bundle these desktop dependencies.

The runtime manager downloads portable components directly from their official sources after review.
It retains the Node executable and full LICENSE, the complete MinGit distribution and its LICENSE.txt
and dependency license directory, and the CodeGraph library with its dependency notices. It adds the
tagged CodeGraph MIT notice included here because the platform ZIP omits that root notice. It does not
install CodeGraph's npm shim or use its automatic downloader, updater or hook-installing CLI init.

- Node 24.20.0: [official release and source archives](https://nodejs.org/dist/v24.20.0/).
- npm 11.19.1: [tagged source and license](https://github.com/npm/cli/tree/v11.19.1).
- MinGit 2.55.0.windows.5: [official download](https://github.com/git-for-windows/git/releases/tag/v2.55.0.windows.5)
  and [tagged Git source](https://github.com/git-for-windows/git/tree/v2.55.0.windows.5), GPL-2.0-only for Git
  with separately included component notices. MinGit is fetched by the user's app from its upstream release;
  this app source tree does not redistribute its binaries. A future mirrored/bundled distribution needs
  its own corresponding-source delivery review, including bundled components.
- CodeGraph 1.6.0: [tagged MIT license](https://github.com/colbymchenry/codegraph/blob/v1.6.0/LICENSE)
  and [tagged source](https://github.com/colbymchenry/codegraph/tree/v1.6.0).

The Windows x64 pins, downloaded sizes, hashes and installed-tree identities are in the runtime catalog.
Other native platforms, engines, models and graph providers are not automatically installed by this catalog.
