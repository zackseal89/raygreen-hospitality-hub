import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '@/components/auth/AuthForm'
import { useAuth } from '@/hooks/useAuth'

const AdminAuth = () => {
  const navigate = useNavigate()
  const { user, userRole, loading } = useAuth()

  useEffect(() => {
    // If user is already authenticated and is an admin, redirect to admin dashboard
    if (!loading && user && userRole === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, userRole, loading, navigate])

  const handleAuthSuccess = () => {
    navigate('/admin', { replace: true })
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is logged in but not admin, show access denied
  if (user && userRole && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have administrator privileges.</p>
        </div>
      </div>
    )
  }

  return <AuthForm onSuccess={handleAuthSuccess} />
}

export default AdminAuth