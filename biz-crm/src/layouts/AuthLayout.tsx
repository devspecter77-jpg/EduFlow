import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Biz Educational</h1>
          <p className="mt-2 text-muted-foreground">
            O'quv Markazi Boshqaruv Tizimi
          </p>
        </div>

        {/* Auth Content */}
        <div className="rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          © 2026 Biz Educational Center
        </div>
      </div>
    </div>
  );
}
