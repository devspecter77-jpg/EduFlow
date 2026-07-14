import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { Hero } from './Hero';
import { Features } from './Features';
import { WhyEduFlow } from './WhyEduFlow';
import { DashboardShowcase } from './DashboardShowcase';
import { Pricing } from './Pricing';
import { Testimonials } from './Testimonials';
import { FAQ } from './FAQ';
import { CTA } from './CTA';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 sm:pb-0">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <WhyEduFlow />
        <DashboardShowcase />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
