import { useLocalSearchParams, useRouter } from 'expo-router';
import BusinessProfile from '../features/business-profile/BusinessProfile';
import { mockBusiness } from '../features/business-profile/mock';

export default function BusinessRoute() {
  const { dev } = useLocalSearchParams<{ dev?: string }>();
  const router = useRouter();

  if (dev === 'owner') {
    return (
      <BusinessProfile
        state="OWNER"
        business={mockBusiness}
        onPreview={() => router.push({ pathname: '/business', params: { dev: 'preview' } })}
      />
    );
  }

  if (dev === 'preview') {
    return (
      <BusinessProfile
        state="PREVIEW"
        business={mockBusiness}
        onExitPreview={() => router.push({ pathname: '/business', params: { dev: 'owner' } })}
      />
    );
  }

  if (dev === 'canmessage') {
    return <BusinessProfile state="VISITOR" business={mockBusiness} canMessage />;
  }

  return <BusinessProfile state="VISITOR" business={mockBusiness} canMessage={false} />;
}
