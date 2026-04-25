import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — PowerWatch" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { signInEmail, signUpEmail, signInGoogle, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pickedRole, setPickedRole] = useState<AppRole>("public");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      navigate({ to: role === "senior" ? "/senior" : role === "junior" ? "/junior" : "/public" });
    }
  }, [user, role, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } =
      mode === "signin"
        ? await signInEmail(email, password)
        : await signUpEmail(email, password, fullName || email.split("@")[0], pickedRole);
    setBusy(false);
    if (error) setErr(error);
  }

  async function google() {
    setErr(null);
    const { error } = await signInGoogle(pickedRole);
    if (error) setErr(error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">PowerWatch</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              State Electricity Board
            </div>
          </div>
        </Link>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex gap-1 rounded-md bg-surface-2 p-1 text-xs font-medium">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded px-3 py-1.5 transition-colors",
                  mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Full name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="Anita Sharma"
                  />
                </Field>
                <Field label="I am a">
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["senior", "junior", "public"] as const).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setPickedRole(r)}
                        className={cn(
                          "rounded-md border px-2 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors",
                          pickedRole === r
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {r === "public" ? "Citizen" : r}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </Field>

            {err && (
              <div className="rounded-md border border-severity-critical/40 bg-severity-critical-soft p-2.5 text-[12px] text-severity-critical">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={google}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          {mode === "signup" && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Google signup uses the role selected above.
            </p>
          )}
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Back to home
        </Link>
      </div>

      <style>{`.input{width:100%;border:1px solid hsl(var(--border));background:var(--surface,#fff);border-radius:6px;padding:8px 10px;font-size:13px;outline:none}.input:focus{border-color:currentColor}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
