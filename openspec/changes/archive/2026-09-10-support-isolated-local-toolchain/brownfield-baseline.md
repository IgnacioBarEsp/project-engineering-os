Core 0.4.0 at 491d9c3: the OpenSpec wrapper and opsx-check read root node_modules, and doctor reads root
manifests/installations for OpenSpec and release identity. Adoption #85 preserves product manifests, so
Companion needs explicit local toolchain resolution. No runtime-location option exists in the config schema.
