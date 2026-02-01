import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Helper to infer types from the API definition
type UpdateGuestInput = z.infer<typeof api.guests.update.input>;

export function useGuestBySlug(slug: string | null) {
  return useQuery({
    queryKey: [api.guests.getBySlug.path, slug],
    queryFn: async () => {
      if (!slug) return null;
      const url = buildUrl(api.guests.getBySlug.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch guest");
      
      return api.guests.getBySlug.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateGuestInput) => {
      const url = buildUrl(api.guests.update.path, { id });
      const validated = api.guests.update.input.parse(data);
      
      const res = await fetch(url, {
        method: api.guests.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Guest not found");
        throw new Error("Failed to update guest");
      }
      
      return api.guests.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate specific guest query and the list if needed
      queryClient.invalidateQueries({ queryKey: [api.guests.getBySlug.path, data.slug] });
    },
  });
}
