import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  guestName: string;
  guestEmail: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalPrice: number;
  bookingReference: string;
  specialRequests?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: BookingConfirmationRequest = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation - Raygreen Hotel</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2D5A27 0%, #C5A572 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Booking Confirmation</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Raygreen Hotel, Kisumu</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2D5A27;">
              <h2 style="color: #2D5A27; margin-top: 0;">Dear ${bookingData.guestName},</h2>
              <p>Thank you for choosing Raygreen Hotel! We're delighted to confirm your reservation.</p>
              <p><strong>Booking Reference:</strong> ${bookingData.bookingReference}</p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2D5A27; margin-top: 0; border-bottom: 2px solid #C5A572; padding-bottom: 10px;">Booking Details</h3>
              
              <div style="display: grid; gap: 15px;">
                <div style="padding: 15px; background: #f8f9fa; border-radius: 6px;">
                  <strong style="color: #2D5A27;">Room Type:</strong><br>
                  <span style="font-size: 18px;">${bookingData.roomType}</span>
                </div>
                
                <div style="display: flex; gap: 20px;">
                  <div style="flex: 1; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                    <strong style="color: #2D5A27;">Check-in:</strong><br>
                    ${formatDate(bookingData.checkInDate)}
                  </div>
                  <div style="flex: 1; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                    <strong style="color: #2D5A27;">Check-out:</strong><br>
                    ${formatDate(bookingData.checkOutDate)}
                  </div>
                </div>
                
                <div style="display: flex; gap: 20px;">
                  <div style="flex: 1; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                    <strong style="color: #2D5A27;">Guests:</strong><br>
                    ${bookingData.adults} Adult${bookingData.adults > 1 ? 's' : ''}${bookingData.children > 0 ? `, ${bookingData.children} Child${bookingData.children > 1 ? 'ren' : ''}` : ''}
                  </div>
                  <div style="flex: 1; padding: 15px; background: #2D5A27; color: white; border-radius: 6px;">
                    <strong>Total Amount:</strong><br>
                    <span style="font-size: 24px; font-weight: bold;">${formatCurrency(bookingData.totalPrice)}</span>
                  </div>
                </div>
                
                ${bookingData.specialRequests ? `
                <div style="padding: 15px; background: #fff3cd; border: 1px solid #C5A572; border-radius: 6px;">
                  <strong style="color: #856404;">Special Requests:</strong><br>
                  ${bookingData.specialRequests}
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2D5A27; margin-top: 0; border-bottom: 2px solid #C5A572; padding-bottom: 10px;">What's Next?</h3>
              <ul style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">Our team will contact you within 24 hours to confirm final details</li>
                <li style="margin-bottom: 10px;">Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
                <li style="margin-bottom: 10px;">Please bring a valid ID for check-in</li>
                <li style="margin-bottom: 10px;">Contact us if you need to modify your booking</li>
              </ul>
            </div>

            <div style="background: #2D5A27; color: white; padding: 25px; border-radius: 8px; text-align: center;">
              <h3 style="margin-top: 0;">Contact Information</h3>
              <p style="margin: 5px 0;">📧 Email: info@raygreenhotel.com</p>
              <p style="margin: 5px 0;">📞 Phone: +254 123 456 789</p>
              <p style="margin: 5px 0;">📍 Location: Kisumu, Kenya</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                We look forward to welcoming you to Raygreen Hotel!<br>
                <em>Experience comfort and luxury in the heart of Kisumu</em>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Raygreen Hotel <noreply@resend.dev>",
      to: [bookingData.guestEmail],
      subject: `Booking Confirmation - Raygreen Hotel (${bookingData.checkInDate})`,
      html: emailHtml,
    });

    console.log("Booking confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);