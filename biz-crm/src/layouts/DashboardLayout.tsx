import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar, MobileSidebar, MobileHeader, Breadcrumb } from "@/components/layout";
import { SubscriptionBanner } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useTrial } from "@/hooks/useTrial";
import { ROUTES } from "@/constants";
import { schedulePrefetch } from "@/routes/prefetch";

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { isExpired } = useTrial();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to trial expired page if trial has ended (except for super admins)
    if (user && user.role !== 'SUPER_ADMIN' && isExpired) {
      navigate(ROUTES.TRIAL_EXPIRED, { replace: true });
    }
  }, [user, isExpired, navigate]);

  useEffect(() => {
    schedulePrefetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Subscription Banner — always on top */}
        <SubscriptionBanner />

        {/* Header */}
        <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="pt-16">
          <div className="container mx-auto p-4 sm:p-6">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
