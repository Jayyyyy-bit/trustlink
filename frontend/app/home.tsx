import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { color, space } from '../components/ui/tokens';
import { ErrorState } from '../components/ui/ErrorState';
import HomeFeed from '../features/home-feed/HomeFeed';
import { HomeFeedSkeleton } from '../features/home-feed/HomeFeedSkeleton';
import {
  mockViewer,
  mockRequirements,
  mockRequirementBuyers,
  mockMyRequirements,
  mockRecentlyClosed,
  mockMessageThreads,
  mockMessagesByThread,
} from '../features/home-feed/mock';
import type { FeedBuyer } from '../features/home-feed/types';
import { USE_MOCK_DATA } from '../lib/api/flags';
import { ApiError } from '../lib/api/client';
import { listRequirements } from '../lib/api/requirements';
import { getBusiness } from '../lib/api/businesses';
import type { BusinessId, Requirement } from '../lib/types';

export default function HomeRoute() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirement[] | null>(USE_MOCK_DATA ? mockRequirements : null);
  const [requirementBuyers, setRequirementBuyers] = useState<Record<BusinessId, FeedBuyer>>(
    USE_MOCK_DATA ? mockRequirementBuyers : {},
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (USE_MOCK_DATA) return;
    setError(null);
    try {
      const list = await listRequirements();
      const buyerIds = Array.from(new Set(list.map((r) => r.buyerId)));
      const buyers = await Promise.all(buyerIds.map((id) => getBusiness(id)));
      setRequirements(list);
      setRequirementBuyers(Object.fromEntries(buyers.map((b) => [b.id, b])));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the requirements feed.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  const refToByRequirementId = new Map((requirements ?? []).map((r) => [r.id, r.ref]));

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, padding: space.lg }}>
        <ErrorState message={error} onRetry={() => setReloadToken((n) => n + 1)} />
      </View>
    );
  }

  if (!requirements) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: color.canvas }}>
        <HomeFeedSkeleton />
      </ScrollView>
    );
  }

  return (
    <HomeFeed
      viewer={mockViewer}
      requirements={requirements}
      requirementBuyers={requirementBuyers}
      myRequirements={mockMyRequirements}
      recentlyClosed={mockRecentlyClosed}
      messageThreads={mockMessageThreads}
      messagesByThread={mockMessagesByThread}
      onPostRequirement={() => router.push('/post-requirement')}
      onSelectRequirement={(requirementId) => {
        const ref = refToByRequirementId.get(requirementId);
        if (ref) router.push({ pathname: '/requirement', params: { ref } });
      }}
      onSubmitQuotation={(requirementId) => {
        const ref = refToByRequirementId.get(requirementId);
        if (ref) router.push({ pathname: '/submit-quotation', params: { ref } });
      }}
    />
  );
}
