import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { buildFormData } from "@/lib/torrent-utils";
import type { PendingTorrent } from "@/store/torrent-store";

export interface QBTorrent {
  hash: string;
  name: string;
  category: string;
  save_path: string;
  state: string;
  progress: number;
  dlspeed: number;
  upspeed: number;
  added_on: number;
}

export interface Category {
  name: string;
  savePath: string;
}

export interface Preferences {
  save_path: string;
}

export function useGetTorrents() {
  return useQuery({
    queryKey: ["torrents"],
    queryFn: () => apiClient.get<QBTorrent[]>("/torrents"),
  });
}

export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<Record<string, Category>>("/categories"),
  });
}

export function useGetPreferences() {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: () => apiClient.get<Preferences>("/preferences"),
  });
}

export function useAddTorrents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: PendingTorrent[]) => {
      const results = await Promise.allSettled(
        items.map((item) => {
          const formData = buildFormData(item);
          return apiClient.post("/torrents/add", formData);
        }),
      );

      // Return failed items
      const failed = results
        .map((result, index) =>
          result.status === "rejected" ? items[index] : null,
        )
        .filter((item): item is PendingTorrent => item !== null);

      return failed;
    },
    onSuccess: (failed) => {
      if (failed.length === 0) {
        toast.success("All torrents added successfully");
      } else {
        toast.error(`${failed.length} torrent(s) failed to add`);
      }
      queryClient.invalidateQueries({ queryKey: ["torrents"] });
    },
    onError: () => {
      toast.error("Failed to add torrents");
    },
  });
}
