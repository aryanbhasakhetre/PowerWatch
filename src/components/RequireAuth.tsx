import { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth";

export function RequireAuth({
  role,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  const { user, role: myRole, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xs uppercase tracking-wider text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  if (myRole !== role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-severity-critical">
          Access denied
        </div>
        <div className="text-sm text-muted-foreground">
          This area is restricted to <strong>{role}</strong> accounts.
          <br />
          You are signed in as <strong>{myRole}</strong>.
        </div>
        <Navigate to={myRole === "senior" ? "/senior" : myRole === "junior" ? "/junior" : "/public"} />
      </div>
    );
  }
  return <>{children}</>;
}
