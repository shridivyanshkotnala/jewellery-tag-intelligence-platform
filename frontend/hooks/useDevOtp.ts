import { useCallback, useEffect, useState } from 'react';

import { fetchDevOtps } from '@/utils/authApi';

export function useDevOtp(businessId: string | undefined, type: 'phone' | 'email') {
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const refreshDevOtp = useCallback(async () => {
    if (!__DEV__ || !businessId) {
      setDevOtp(null);
      return;
    }

    const otps = await fetchDevOtps(businessId);
    setDevOtp(otps[type] ?? null);
  }, [businessId, type]);

  useEffect(() => {
    void refreshDevOtp();
  }, [refreshDevOtp]);

  return { devOtp, refreshDevOtp };
}
