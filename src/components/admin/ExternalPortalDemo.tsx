import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Activity, Bed, ChefHat, Eye, Plus, Edit, Trash2 } from 'lucide-react'

export const ExternalPortalDemo = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [newRoomType, setNewRoomType] = useState({
    name: '',
    description: '',
    base_price: '',
    max_occupancy: '',
    amenities: [] as string[]
  })
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true
  })
  const [editingItem, setEditingItem] = useState<any>(null)

  // Real-time data hooks
  const { data: roomTypes, refresh: refreshRooms } = useRealtimeData({
    table: 'room_types',
    onInsert: () => {
      toast.success('New room type added!')
      refreshRooms()
    },
    onUpdate: () => {
      toast.success('Room type updated!')
      refreshRooms()
    },
    onDelete: () => {
      toast.success('Room type deleted!')
      refreshRooms()
    }
  })

  const { data: menuItems, refresh: refreshMenu } = useRealtimeData({
    table: 'menu_items',
    onInsert: () => {
      toast.success('New menu item added!')
      refreshMenu()
    },
    onUpdate: () => {
      toast.success('Menu item updated!')
      refreshMenu()
    },
    onDelete: () => {
      toast.success('Menu item deleted!')
      refreshMenu()
    }
  })

  const { data: bookings } = useRealtimeData({
    table: 'bookings',
    onInsert: (payload) => {
      toast.success(`New booking from ${payload.new.guest_name}!`)
    },
    onUpdate: (payload) => {
      toast.success(`Booking ${payload.new.status}: ${payload.new.guest_name}`)
    }
  })

  const handleAddRoomType = async () => {
    if (!newRoomType.name || !newRoomType.base_price) {
      toast.error('Please fill in required fields')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('room_types')
        .insert({
          name: newRoomType.name,
          description: newRoomType.description,
          base_price: parseFloat(newRoomType.base_price),
          max_occupancy: parseInt(newRoomType.max_occupancy) || 2,
          amenities: newRoomType.amenities
        })

      if (error) throw error

      setNewRoomType({
        name: '',
        description: '',
        base_price: '',
        max_occupancy: '',
        amenities: []
      })
      
      toast.success('Room type added successfully!')
    } catch (error) {
      console.error('Error adding room type:', error)
      toast.error('Failed to add room type')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      toast.error('Please fill in required fields')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          name: newMenuItem.name,
          description: newMenuItem.description,
          price: parseFloat(newMenuItem.price),
          category: newMenuItem.category || 'Other',
          available: newMenuItem.available
        })

      if (error) throw error

      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        category: '',
        available: true
      })
      
      toast.success('Menu item added successfully!')
    } catch (error) {
      console.error('Error adding menu item:', error)
      toast.error('Failed to add menu item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error
      toast.success(`Booking ${newStatus} successfully!`)
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking status')
    }
  }

  const handleDeleteItem = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Item deleted successfully!')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Direct Admin Management</h2>
          <p className="text-muted-foreground">Manage your hotel data with real-time updates</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Activity className="h-3 w-3 mr-1" />
          Live Connected
        </Badge>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            Room Management
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Menu Management
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Booking Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <div className="grid gap-6">
            {/* Add New Room Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Room Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room-name">Room Name *</Label>
                    <Input
                      id="room-name"
                      value={newRoomType.name}
                      onChange={(e) => setNewRoomType(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Deluxe Suite"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room-price">Base Price (KES) *</Label>
                    <Input
                      id="room-price"
                      type="number"
                      value={newRoomType.base_price}
                      onChange={(e) => setNewRoomType(prev => ({ ...prev, base_price: e.target.value }))}
                      placeholder="e.g., 15000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room-occupancy">Max Occupancy</Label>
                    <Input
                      id="room-occupancy"
                      type="number"
                      value={newRoomType.max_occupancy}
                      onChange={(e) => setNewRoomType(prev => ({ ...prev, max_occupancy: e.target.value }))}
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="room-description">Description</Label>
                  <Textarea
                    id="room-description"
                    value={newRoomType.description}
                    onChange={(e) => setNewRoomType(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the room features..."
                  />
                </div>
                <Button onClick={handleAddRoomType} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room Type
                </Button>
              </CardContent>
            </Card>

            {/* Existing Room Types */}
            <Card>
              <CardHeader>
                <CardTitle>Current Room Types ({roomTypes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {roomTypes.length > 0 ? (
                  <div className="space-y-4">
                    {roomTypes.map((room: any) => (
                      <div key={room.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{room.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>Max: {room.max_occupancy} guests</span>
                              <span className="font-medium text-hotel-green">
                                KES {Number(room.base_price).toLocaleString()}/night
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteItem('room_types', room.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No room types available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="menu">
          <div className="grid gap-6">
            {/* Add New Menu Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Menu Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="menu-name">Item Name *</Label>
                    <Input
                      id="menu-name"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Grilled Salmon"
                    />
                  </div>
                  <div>
                    <Label htmlFor="menu-price">Price (KES) *</Label>
                    <Input
                      id="menu-price"
                      type="number"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., 2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="menu-category">Category</Label>
                    <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Appetizer">Appetizer</SelectItem>
                        <SelectItem value="Main Course">Main Course</SelectItem>
                        <SelectItem value="Dessert">Dessert</SelectItem>
                        <SelectItem value="Beverage">Beverage</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="menu-description">Description</Label>
                  <Textarea
                    id="menu-description"
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the dish..."
                  />
                </div>
                <Button onClick={handleAddMenuItem} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </CardContent>
            </Card>

            {/* Existing Menu Items */}
            <Card>
              <CardHeader>
                <CardTitle>Current Menu Items ({menuItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {menuItems.length > 0 ? (
                  <div className="space-y-4">
                    {menuItems.map((item: any) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <span className="font-medium text-hotel-green">
                                KES {Number(item.price).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteItem('menu_items', item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No menu items available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 10).map((booking: any) => (
                    <div key={booking.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{booking.guest_name}</h3>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' : 
                              booking.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {booking.check_in_date} → {booking.check_out_date}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            KES {Number(booking.total_price).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No bookings available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
