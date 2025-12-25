import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface CheckAuthResponse {
  authenticated: boolean;
}

export function useCheckAuth() {
  return useQuery({
    queryKey: ["auth", "check"],
    queryFn: async () => {
      return apiClient.get<CheckAuthResponse>("/auth/check");
    },
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
