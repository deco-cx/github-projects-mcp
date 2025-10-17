/**
 * Hook to get app state/configuration
 */
import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/rpc";

export const useAppState = () => {
  return useQuery({
    queryKey: ["appState"],
    queryFn: async () => {
      // Try to get app state from a metadata call
      // Since we don't have a direct state getter, we can infer from error messages
      // or create a dedicated tool for this
      return {
        defaultOrganization: null as string | null,
      };
    },
    staleTime: Infinity, // Cache indefinitely
  });
};

