import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminBookingAlertRequest {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  adults: number;
  children: number;
  totalPrice: number;
  specialRequests?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      bookingReference,
      checkInDate,
      checkOutDate,
      roomType,
      adults,
      children,
      totalPrice,
      specialRequests
    }: AdminBookingAlertRequest = await req.json();

    console.log("Sending admin booking alert for:", bookingReference);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Alert - Ray Green Hotel</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2E7D32; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2E7D32; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #2E7D32; }
            .value { color: #333; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏨 New Booking Alert</h1>
              <h2>Ray Green Hotel</h2>
            </div>
            
            <div class="content">
              <div class="urgent">
                <h3>⚠️ Action Required</h3>
                <p>A new booking has been confirmed and requires your attention.</p>
              </div>

              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                
                <div class="detail-row">
                  <span class="label">Booking Reference:</span>
                  <span class="value"><strong>${bookingReference}</strong></span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Guest Name:</span>
                  <span class="value">${guestName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Email:</span>
                  <span class="value">${guestEmail}</span>
                </div>
                
                ${guestPhone ? `
                <div class="detail-row">
                  <span class="label">Phone:</span>
                  <span class="value">${guestPhone}</span>
                </div>
                ` : ''}
                
                <div class="detail-row">
                  <span class="label">Room Type:</span>
                  <span class="value">${roomType}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Check-in:</span>
                  <span class="value">${formatDate(checkInDate)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Check-out:</span>
                  <span class="value">${formatDate(checkOutDate)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Guests:</span>
                  <span class="value">${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)` : ''}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span class="value"><strong>${formatCurrency(totalPrice)}</strong></span>
                </div>
                
                ${specialRequests ? `
                <div class="detail-row">
                  <span class="label">Special Requests:</span>
                  <span class="value">${specialRequests}</span>
                </div>
                ` : ''}
              </div>

              <div class="urgent">
                <h3>📝 Next Steps</h3>
                <ul>
                  <li>Review the booking details above</li>
                  <li>Prepare the ${roomType} for ${formatDate(checkInDate)}</li>
                  <li>Contact guest if needed: <a href="mailto:${guestEmail}">${guestEmail}</a></li>
                  <li>Update your internal booking system</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Ray Green Hotel booking system.</p>
              <p>Booking Reference: ${bookingReference}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Ray Green Hotel <reservations@raygreenhotel.com>",
      to: ["reservations@raygreenhotel.com"],
      subject: `🏨 New Booking Alert - ${bookingReference} | ${guestName}`,
      html: htmlContent,
    });

    console.log("Admin alert email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Admin booking alert sent successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-admin-booking-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);