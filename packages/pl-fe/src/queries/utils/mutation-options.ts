import type { DefaultError } from '@tanstack/query-core';
import type { UseMutationOptions } from '@tanstack/react-query';

// From https://github.com/TanStack/query/discussions/6096#discussioncomment-9685102
const mutationOptions = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TContext>): UseMutationOptions<TData, TError, TVariables, TContext> => options;

export { mutationOptions };
