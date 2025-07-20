import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center">
            <div className="animate-pulse bg-muted rounded-lg h-96 w-full max-w-md"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to Raygreen Hotel
            </h1>
            <p className="text-xl text-hotel-gold mb-8">
              Sign in to manage your bookings and enjoy exclusive benefits
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <AuthForm redirectTo={redirectTo} />
      </div>
    </Layout>
  );
};

export default Auth;