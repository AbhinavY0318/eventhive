
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { FunctionReference } from "convex/server";

/* -----------------------------------------
   useConvexQuery
------------------------------------------ */

export function useConvexQuery<T = unknown>(
  query: FunctionReference<"query">,
  args?: any
) {
  // IMPORTANT: pass args as a SINGLE value
  const result = args === undefined
    ? useQuery(query as any)
    : useQuery(query as any, args);

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (result === undefined) {
      setIsLoading(true);
      return;
    }

    try {
      setData(result as T);
      setError(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [result]);

  return { data, isLoading, error };
}

/* -----------------------------------------
   useConvexMutation
------------------------------------------ */

export function useConvexMutation<T = unknown>(
  mutation: FunctionReference<"mutation">
) {
  const mutationFn = useMutation(mutation as any);

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (args?: any): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const response =
        args === undefined
          ? await mutationFn()
          : await mutationFn(args);

      setData(response as T);
      return response as T;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
}
