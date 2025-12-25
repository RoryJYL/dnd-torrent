import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 5000));

    const checkPromise = (async () => {
      try {
        const response = await apiClient.get<{ authenticated: boolean }>(
          "/auth/check",
        );
        useAuthStore.getState().setIsAuthenticated(response.authenticated);
      } catch {
        useAuthStore.getState().setIsAuthenticated(false);
      }
    })();

    await Promise.race([checkPromise, timeoutPromise]);
  },
  component: RootComponent,
  pendingComponent: LoadingComponent,
});

function LoadingComponent() {
  return (
    <div className="min-h-svh w-full flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

function RootComponent() {
  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
}
