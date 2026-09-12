import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { color, space } from '../components/ui/tokens';
import { ErrorState } from '../components/ui/ErrorState';
import BusinessProfile from '../features/business-profile/BusinessProfile';
import { BusinessProfileSkeleton } from '../features/business-profile/BusinessProfileSkeleton';
import { mockBusiness } from '../features/business-profile/mock';
import { USE_MOCK_DATA } from '../lib/api/flags';
import { ApiError } from '../lib/api/client';
import { getBusiness } from '../lib/api/businesses';
import type { Business } from '../lib/types';

export default function BusinessRoute() {
  const { dev, id } = useLocalSearchParams<{ dev?: string; id?: string }>();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(USE_MOCK_DATA ? mockBusiness : null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (USE_MOCK_DATA || !id) return;
    setError(null);
    setBusiness(null);
    try {
      setBusiness(await getBusiness(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this business profile.');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (!USE_MOCK_DATA) {
    if (!id) {
      return (
        <View style={{ flex: 1, backgroundColor: color.canvas, padding: space.lg }}>
          <ErrorState message="No business specified." />
        </View>
      );
    }
    if (error) {
      return (
        <View style={{ flex: 1, backgroundColor: color.canvas, padding: space.lg }}>
          <ErrorState message={error} onRetry={() => setReloadToken((n) => n + 1)} />
        </View>
      );
    }
    if (!business) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: color.canvas }}>
          <BusinessProfileSkeleton />
        </ScrollView>
      );
    }
  }

  const resolved = business ?? mockBusiness;

  if (dev === 'owner') {
    return (
      <BusinessProfile
        state="OWNER"
        business={resolved}
        onPreview={() => router.push({ pathname: '/business', params: { dev: 'preview', id } })}
      />
    );
  }

  if (dev === 'preview') {
    return (
      <BusinessProfile
        state="PREVIEW"
        business={resolved}
        onExitPreview={() => router.push({ pathname: '/business', params: { dev: 'owner', id } })}
      />
    );
  }

  if (dev === 'canmessage') {
    return <BusinessProfile state="VISITOR" business={resolved} canMessage />;
  }

  return <BusinessProfile state="VISITOR" business={resolved} canMessage={false} />;
}
