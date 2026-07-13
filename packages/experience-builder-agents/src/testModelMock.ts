/**
 * testModelMock.ts
 *
 * A shared, CREDENTIAL-FREE model-mock factory for the GEN-04/05 tests. It lets
 * a test inject a deterministic `callModel` replacement — typically a queue of
 * fail-then-succeed structured outputs — WITHOUT an `ANTHROPIC_API_KEY` and
 * without any network access.
 *
 * Usage (GEN-05 retry test):
 *
 *   const mock = createModelMock([
 *     invalidIrObject,   // attempt 1 → Zod parse fails → retry
 *     validIrObject,     // attempt 2 → succeeds
 *   ]);
 *   const restore = __setCallModelImpl(mock.impl);
 *   try { ... } finally { restore(); }
 *   expect(mock.callCount()).toBe(2);
 *
 * The mock is intentionally schema-agnostic: it returns the next queued object
 * verbatim and lets the CALLER (`irGenerator`) run `parseIR` / `validateAst`,
 * so the retry/cap logic under test is exercised exactly as in production. Each
 * queued entry may be a static value OR a function of the call args (so a test
 * can assert the appended error feedback reached the prompt, D-06).
 */

import type { CallModelArgs } from './modelAdapter';

/** A queued response: a static object, or a function of the call args. */
export type MockResponse<T = unknown> =
  | T
  | ((args: CallModelArgs<never>) => T);

export interface ModelMock {
  /** The `callModel`-shaped implementation to pass to `__setCallModelImpl`. */
  impl: <TSchema extends import('zod').z.ZodType>(
    args: CallModelArgs<TSchema>,
  ) => Promise<import('zod').z.infer<TSchema>>;
  /** Number of times the mock was invoked (proves loop count + cap, D-06). */
  callCount: () => number;
  /** The args of each invocation in order (assert prompt error-feedback). */
  calls: () => Array<CallModelArgs<never>>;
}

/**
 * Build a deterministic, credential-free `callModel` mock from an ordered queue
 * of responses. The Nth invocation returns the Nth queued response (resolving
 * function entries against the call args). When the queue is exhausted, the
 * last response repeats — so a "cap-reached" test can supply a single
 * always-invalid response and rely on the caller's attempt cap to terminate.
 */
export function createModelMock<T = unknown>(queue: Array<MockResponse<T>>): ModelMock {
  if (queue.length === 0) {
    throw new Error('createModelMock requires at least one queued response.');
  }
  const calls: Array<CallModelArgs<never>> = [];

  const impl = async <TSchema extends import('zod').z.ZodType>(
    args: CallModelArgs<TSchema>,
  ): Promise<import('zod').z.infer<TSchema>> => {
    const index = Math.min(calls.length, queue.length - 1);
    calls.push(args as unknown as CallModelArgs<never>);
    const entry = queue[index];
    const value =
      typeof entry === 'function'
        ? (entry as (a: CallModelArgs<never>) => T)(args as unknown as CallModelArgs<never>)
        : entry;
    return value as import('zod').z.infer<TSchema>;
  };

  return {
    impl,
    callCount: () => calls.length,
    calls: () => calls,
  };
}
