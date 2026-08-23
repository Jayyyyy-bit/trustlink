import HomeFeed from '../features/home-feed/HomeFeed';
import {
  mockViewer,
  mockRequirements,
  mockRequirementBuyers,
  mockMyRequirements,
  mockRecentlyClosed,
  mockAlerts,
  mockMessageThreads,
} from '../features/home-feed/mock';

export default function HomeRoute() {
  return (
    <HomeFeed
      viewer={mockViewer}
      requirements={mockRequirements}
      requirementBuyers={mockRequirementBuyers}
      myRequirements={mockMyRequirements}
      recentlyClosed={mockRecentlyClosed}
      alerts={mockAlerts}
      messageThreads={mockMessageThreads}
    />
  );
}
