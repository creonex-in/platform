// Invalidate a `.all()` key to bust every query in that domain at once.
// Each unique filters object gets its own isolated cache entry.

export const queryKeys = {
  courses: {
    all: () => ["courses"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters
        ? (["courses", "list", filters] as const)
        : (["courses", "list"] as const),
    detail: (slug: string) => ["courses", "detail", slug] as const,
  },

  experts: {
    all: () => ["experts"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters
        ? (["experts", "list", filters] as const)
        : (["experts", "list"] as const),
    detail: (username: string) => ["experts", "detail", username] as const,
  },

  categories: {
    all: () => ["categories"] as const,
    root: () => ["categories", { minimal: true }] as const,
    list: (filters?: Record<string, unknown>) =>
      filters
        ? (["categories", filters] as const)
        : (["categories"] as const),
    children: (slug: string) => ["category-children", slug] as const,
    detail: (identifier: string | number) =>
      ["categories", "detail", identifier] as const,
  },

  bookings: {
    all: () => ["bookings"] as const,
    list: () => ["bookings", "list"] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },

  users: {
    all: ["users"] as const,
    // Nested under users.all so invalidating all users also invalidates "me".
    me: () => [...queryKeys.users.all, "me"] as const,
  },
} as const;
