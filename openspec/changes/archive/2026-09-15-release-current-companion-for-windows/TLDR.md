# TL;DR

Prepare Companion 0.2.0 and the reviewed Windows release workflow; do not publish it in this source PR.
The later release tags clean main and verifies the exact installer before and after upload. 0.1.0 stays
immutable; core npm stays 0.5.0. Native automation runs only on a disposable Windows runner and says what
it did not observe. Public release wording changes only after the release exists.
