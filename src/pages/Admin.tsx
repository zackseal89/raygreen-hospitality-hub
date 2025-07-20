import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RealtimeDashboard } from '@/components/admin/RealtimeDashboard'
import { ExternalPortalDemo } from '@/components/admin/ExternalPortalDemo'
import BookingManagement from '@/components/admin/BookingManagement'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

const Admin = () => {
  const navigate = useNavigate()
  const { user, userRole, loading, signOut } = useAuth()

  useEffect(() => {
    // Redirect to auth page if not authenticated or not admin
    if (!loading && (!user || userRole !== 'admin')) {
      navigate('/admin-auth', { replace: true })
    }
  }, [user, userRole, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render admin content if user is not authenticated or not admin
  if (!user || userRole !== 'admin') {
    return null
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
        
        <div className="space-y-8">
          <BookingManagement />
          <RealtimeDashboard />
          <ExternalPortalDemo />
        </div>
      </div>
    </Layout>
  )
}

export default Admin