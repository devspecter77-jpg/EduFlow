import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-primary sm:text-9xl">404</h1>
        <p className="mt-4 text-xl font-semibold sm:text-2xl">Sahifa topilmadi</p>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
