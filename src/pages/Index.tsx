import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import LocationSection from '@/components/home/LocationSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <LocationSection />
    </Layout>
  );
};

export default Index;
