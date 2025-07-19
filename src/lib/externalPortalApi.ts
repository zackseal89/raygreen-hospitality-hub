// External Portal API Client
class ExternalPortalAPI {
  private baseUrl: string
  private token: string | null = null
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'X-Portal-Token': this.token }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication
  async authenticate(portalName: string, permissions: any = {}) {
    return this.request('external-portal-auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create_token',
        portal_name: portalName,
        permissions
      })
    })
  }

  async validateToken(token: string) {
    return this.request('external-portal-auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'validate_token',
        token
      })
    })
  }

  // Room Management
  async getRooms() {
    return this.request('external-portal-api/rooms')
  }

  async createRoom(roomData: any) {
    return this.request('external-portal-api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    })
  }

  async updateRoom(roomData: any) {
    return this.request('external-portal-api/rooms', {
      method: 'PUT',
      body: JSON.stringify(roomData)
    })
  }

  // Booking Management
  async getBookings() {
    return this.request('external-portal-api/bookings')
  }

  async updateBooking(bookingData: any) {
    return this.request('external-portal-api/bookings', {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    })
  }

  // Menu Management
  async getMenu() {
    return this.request('external-portal-api/menu')
  }

  async createMenuItem(menuItem: any) {
    return this.request('external-portal-api/menu', {
      method: 'POST',
      body: JSON.stringify(menuItem)
    })
  }

  async updateMenuItem(menuItem: any) {
    return this.request('external-portal-api/menu', {
      method: 'PUT',
      body: JSON.stringify(menuItem)
    })
  }

  // Bulk Operations
  async bulkUpdate(table: string, updates: any[]) {
    return this.request('external-portal-api/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ table, updates })
    })
  }

  // Dashboard Data
  async getDashboardData() {
    return this.request('realtime-dashboard')
  }

  // WebSocket connection for real-time updates
  createRealtimeConnection(onMessage: (data: any) => void) {
    // This would establish a WebSocket connection to your real-time endpoint
    // For now, we'll use Supabase's built-in real-time functionality
    
    const eventSource = new EventSource(`${this.baseUrl}/realtime-stream`, {
      headers: this.token ? { 'X-Portal-Token': this.token } : undefined
    } as any)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('Failed to parse real-time message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error)
    }

    return eventSource
  }
}

// Example usage for external portals
export const createExternalPortalClient = (baseUrl: string) => {
  return new ExternalPortalAPI(baseUrl)
}

// Default client for the current Supabase project
export const externalPortalApi = new ExternalPortalAPI(
  'https://zqdqbfqsnnetrjimkivv.supabase.co/functions/v1'
)

export default ExternalPortalAPI