// Vitest can't resolve "server-only" (bundled inside Next's compiler, not a
// standalone package). Aliased here in vitest.config.mts. The real package
// only throws when imported into a client bundle, which never happens here.
export {};
