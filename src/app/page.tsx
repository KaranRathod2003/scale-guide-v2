import HeroSection from '@/components/landing/HeroSection';
import ScalingOverview from '@/components/landing/ScalingOverview';
import DeploymentOverview from '@/components/landing/DeploymentOverview';
import PostgreSQLOverview from '@/components/landing/PostgreSQLOverview';
import FeatureHighlights from '@/components/landing/FeatureHighlights';
import NewsTeaser from '@/components/landing/NewsTeaser';
import PlaygroundTeaser from '@/components/landing/PlaygroundTeaser';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ScalingOverview />
      <DeploymentOverview />
      <PostgreSQLOverview />
      <PlaygroundTeaser />
      <NewsTeaser />
      <FeatureHighlights />
    </>
  );
}
