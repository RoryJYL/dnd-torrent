import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm, type LoginFormData } from "@/components/login-form";
import { useLogin } from "@/hooks/use-login";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { mutate: login } = useLogin();
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: async () => {
        setIsAuthenticated(true);
        await navigate({ to: search.redirect || "/dashboard" });
      },
    });
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm onSubmit={onSubmit} />
      </div>
    </div>
  );
}
