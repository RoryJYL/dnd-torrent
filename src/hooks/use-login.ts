import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  username: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      return apiClient.post<LoginResponse>("/login", credentials);
    },
    onSuccess: () => {
      toast.success("Login successful");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Login failed");
    },
  });
}
