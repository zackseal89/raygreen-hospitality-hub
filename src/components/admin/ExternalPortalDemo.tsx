import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { externalPortalApi } from '@/lib/externalPortalApi'
import { toast } from 'sonner'

export const ExternalPortalDemo = () => {
  const [portalToken, setPortalToken] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const handleCreateToken = async () => {
    try {
      setLoading(true)
      const response = await externalPortalApi.authenticate('Demo External Portal', {
        rooms: 'read_write',
        bookings: 'read_write',
        menu: 'read_write'
      })
      
      if (response.success) {
        setPortalToken(response.token)
        externalPortalApi.setToken(response.token)
        setTokenValid(true)
        toast.success('Portal token created successfully!')
      }
    } catch (error) {
      toast.error('Failed to create portal token')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateToken = async () => {
    if (!portalToken) return
    
    try {
      setLoading(true)
      const response = await externalPortalApi.validateToken(portalToken)
      
      if (response.success) {
        externalPortalApi.setToken(portalToken)
        setTokenValid(true)
        toast.success('Token validated successfully!')
      }
    } catch (error) {
      setTokenValid(false)
      toast.error('Invalid token')
    } finally {
      setLoading(false)
    }
  }

  const handleGetDashboardData = async () => {
    if (!tokenValid) return
    
    try {
      setLoading(true)
      const data = await externalPortalApi.getDashboardData()
      setDashboardData(data)
      toast.success('Dashboard data fetched!')
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestRoomAPI = async () => {
    if (!tokenValid) return
    
    try {
      setLoading(true)
      
      // Test creating a room
      const newRoom = {
        name: 'Test Suite',
        description: 'A test room created via external portal API',
        base_price: 299.99,
        max_occupancy: 4,
        amenities: ['WiFi', 'TV', 'Air Conditioning']
      }
      
      const response = await externalPortalApi.createRoom(newRoom)
      toast.success(`Room created: ${response.name}`)
    } catch (error) {
      toast.error('Failed to create room')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestMenuAPI = async () => {
    if (!tokenValid) return
    
    try {
      setLoading(true)
      
      // Test creating a menu item
      const newMenuItem = {
        name: 'External Portal Special',
        description: 'A special dish added via external portal',
        category: 'appetizers',
        price: 15.99,
        available: true
      }
      
      const response = await externalPortalApi.createMenuItem(newMenuItem)
      toast.success(`Menu item created: ${response.name}`)
    } catch (error) {
      toast.error('Failed to create menu item')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>External Portal Integration Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant={tokenValid ? 'default' : 'secondary'}>
              {tokenValid ? 'Connected' : 'Disconnected'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Portal Status
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Portal Token</Label>
            <div className="flex space-x-2">
              <Input
                id="token"
                value={portalToken}
                onChange={(e) => setPortalToken(e.target.value)}
                placeholder="Enter portal token or create a new one"
                type="password"
              />
              <Button onClick={handleValidateToken} disabled={loading || !portalToken}>
                Validate
              </Button>
            </div>
          </div>

          <Button onClick={handleCreateToken} disabled={loading} className="w-full">
            Create New Portal Token
          </Button>
        </CardContent>
      </Card>

      {tokenValid && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>API Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleGetDashboardData} disabled={loading}>
                  Get Dashboard Data
                </Button>
                <Button onClick={handleTestRoomAPI} disabled={loading}>
                  Test Room API
                </Button>
                <Button onClick={handleTestMenuAPI} disabled={loading}>
                  Test Menu API
                </Button>
              </div>
            </CardContent>
          </Card>

          {dashboardData && (
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(dashboardData, null, 2)}
                  readOnly
                  className="h-40 font-mono text-xs"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-semibold">For External Portal Developers:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Create a portal token using the authentication API</li>
              <li>Use the token in X-Portal-Token header for all API requests</li>
              <li>Set up real-time WebSocket connection for live updates</li>
              <li>Implement proper error handling and token refresh</li>
            </ol>
          </div>

          <div className="bg-muted p-4 rounded text-sm">
            <p className="font-semibold mb-2">API Endpoints:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <code>POST /functions/v1/external-portal-auth</code> - Authentication</li>
              <li>• <code>GET /functions/v1/external-portal-api/rooms</code> - Get rooms</li>
              <li>• <code>GET /functions/v1/external-portal-api/bookings</code> - Get bookings</li>
              <li>• <code>GET /functions/v1/external-portal-api/menu</code> - Get menu items</li>
              <li>• <code>POST /functions/v1/external-portal-api/bulk-update</code> - Bulk operations</li>
              <li>• <code>GET /functions/v1/realtime-dashboard</code> - Dashboard metrics</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}