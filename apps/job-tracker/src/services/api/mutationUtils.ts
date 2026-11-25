import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

/**
 * `useMutation` that invalidates the given query keys on success.
 * `keysFor` receives the mutation variables so scoped keys (e.g. per
 * application id) can be derived without closing over them.
 */
export function useInvalidatingMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  keysFor: (variables: TVariables) => readonly (readonly unknown[])[],
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables>,
    'mutationFn' | 'onSuccess'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (_data, variables) => {
      for (const queryKey of keysFor(variables)) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

/** `useInvalidatingMutation` for `DELETE` endpoints keyed by resource id. */
export function useInvalidatingDelete(
  request: (id: number) => Promise<unknown>,
  keysFor: () => readonly (readonly unknown[])[],
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) {
  return useInvalidatingMutation(
    async (id: number) => {
      await request(id);
    },
    keysFor,
    options,
  );
}
