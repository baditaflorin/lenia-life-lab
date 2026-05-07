import { QueryClient } from "@tanstack/query-core";
import { starterSpecies } from "../features/lenia/presets";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60,
      staleTime: Number.POSITIVE_INFINITY
    }
  }
});

export function loadStarterSpecies() {
  return queryClient.fetchQuery({
    queryKey: ["starter-species", "v1"],
    queryFn: async () => starterSpecies
  });
}
