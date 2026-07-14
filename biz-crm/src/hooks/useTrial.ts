import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TRIAL_DAYS = 10;

export function useTrial() {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || user.role === 'SUPER_ADMIN') {
      return { 
        isTrialExpired: false, 
        isExpired: false,
        daysLeft: null, 
        trialActive: false 
      };
    }

    // trialEndsAt backend dan kelsa - uni ishlatamiz
    if (user.trialEndsAt) {
      const endsAt = new Date(user.trialEndsAt);
      const now = new Date();
      const diffMs = endsAt.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = daysLeft <= 0;
      
      return {
        isTrialExpired: isExpired,
        isExpired,
        daysLeft: Math.max(0, daysLeft),
        trialActive: daysLeft > 0,
        endsAt,
      };
    }

    // Aks holda createdAt dan hisoblaymiz
    const createdAt = new Date(user.createdAt);
    const trialEnd = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = trialEnd.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Agar subscriptionStatus ACTIVE bo'lsa — trial tugagan emas
    if (user.subscriptionStatus === 'ACTIVE') {
      return { 
        isTrialExpired: false, 
        isExpired: false,
        daysLeft: null, 
        trialActive: false 
      };
    }

    const isExpired = daysLeft <= 0;

    return {
      isTrialExpired: isExpired,
      isExpired,
      daysLeft: Math.max(0, daysLeft),
      trialActive: daysLeft > 0,
      endsAt: trialEnd,
    };
  }, [user]);
}
