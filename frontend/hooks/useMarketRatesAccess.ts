import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useSettingsAccess } from '@/hooks/useSettingsAccess';

export function useMarketRatesAccess() {
  const { userRole, employee } = useSettingsAccess();
  const canEditMarketRates =
    userRole === 'business' || employee?.permissions.edit_market_prices === true;

  return {
    canEditMarketRates,
    canViewMarketRates: true,
  };
}

export function useRequireMarketRatesAccess() {
  const router = useRouter();
  const { canEditMarketRates } = useMarketRatesAccess();

  useEffect(() => {
    if (!canEditMarketRates) {
      router.replace('/dashboard/settings');
    }
  }, [canEditMarketRates, router]);

  return canEditMarketRates;
}
