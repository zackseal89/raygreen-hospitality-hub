import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import UnifiedAdminDashboard from '@/components/admin/UnifiedAdminDashboard'

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    // Redirect to auth page if not authenticated
    if (!loading && !user) {
      navigate('/admin-auth', { replace: true })
    }
  }, [user, loading, navigate])

  // Show loading or don't render admin content if user is not authenticated
  if (loading || !user) {
    return null
  }

  return <UnifiedAdminDashboard />
}

export default Admin
