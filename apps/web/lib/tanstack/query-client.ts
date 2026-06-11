import {
  QueryClient,
  defaultShouldDehydrateQuery,
  environmentManager,
} from "@tanstack/react-query";

// Creates a fresh QueryClient with shared default options.
// Called on every server request and once on the browser.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data prefetched on the server is considered fresh for 60s —
        // prevents an immediate refetch when the client hydrates.
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // By default only settled (success/error) queries are dehydrated.
        // Including "pending" queries enables streaming with Suspense:
        // the server sends the shell immediately and streams data as it resolves.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

// Browser-side singleton — persists across client-side navigations so the
// cache survives route changes without re-fetching already-loaded data.
let browserQueryClient: QueryClient | undefined;

// Returns the correct QueryClient for the current environment:
//   • Server  → always a new instance (no shared state between requests)
//   • Browser → reuses the singleton so the cache lives for the full session
export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
