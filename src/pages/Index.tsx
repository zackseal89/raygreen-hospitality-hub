import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </Layout>
  );
};

export default Index;
