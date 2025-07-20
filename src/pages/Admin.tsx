import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAdmin, loading, signOut } = useAdminAuth()

  useEffect(() => {
    // Redirect to auth page if not authenticated or not admin
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin-auth', { replace: true })
    }
  }, [user, isAdmin, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  // Show loading or don't render admin content if user is not authenticated or not admin
  if (loading || !user || !isAdmin) {
    return null
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
        
        <AdminDashboard />
      </div>
    </Layout>
  )
}

export default Admin