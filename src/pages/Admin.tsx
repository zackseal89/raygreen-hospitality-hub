import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import UnifiedAdminDashboard from '@/components/admin/UnifiedAdminDashboard'

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    // Redirect to auth page if not authenticated or not admin
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin-auth', { replace: true })
    }
  }, [user, isAdmin, loading, navigate])

  // Show loading or don't render admin content if user is not authenticated or not admin
  if (loading || !user || !isAdmin) {
    return null
  }

  return <UnifiedAdminDashboard />
}

export default Admin
