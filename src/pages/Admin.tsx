import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import UnifiedAdminDashboard from '@/components/admin/UnifiedAdminDashboard'

const Admin = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth() // Removed isAdmin

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/admin-auth', { replace: true })
    }
  }, [user, loading, navigate])

  // Show loading or nothing if user is not authenticated yet
  if (loading || !user) {
    return null
  }

  return <UnifiedAdminDashboard />
}

export default Admin
