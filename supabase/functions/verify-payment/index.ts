
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("Session ID is required");
    }

    console.log("Processing payment verification for session:", session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Stripe session status:", session.payment_status);

    if (session.payment_status === "paid") {
      // Get booking details first
      const { data: booking, error: fetchError } = await supabaseClient
        .from("bookings")
        .select(`
          *,
          room_types:room_type_id (
            name,
            base_price
          )
        `)
        .eq("stripe_session_id", session_id)
        .single();

      if (fetchError) {
        console.error("Error fetching booking:", fetchError);
        throw fetchError;
      }
      if (!booking) {
        console.error("Booking not found for session:", session_id);
        throw new Error("Booking not found");
      }

      console.log("Found booking:", booking.id, "for guest:", booking.guest_email);

      // Update booking status to confirmed
      const { error } = await supabaseClient
        .from("bookings")
        .update({ 
          status: "confirmed",
          payment_status: "paid"
        })
        .eq("stripe_session_id", session_id);

      if (error) {
        console.error("Error updating booking status:", error);
        throw error;
      }

      console.log("Booking status updated to confirmed");

      // Send booking confirmation email
      try {
        console.log("Sending confirmation email to:", booking.guest_email);
        
        const { data: emailData, error: emailError } = await supabaseClient.functions.invoke(
          'send-booking-confirmation',
          {
            body: {
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              bookingReference: booking.booking_reference,
              checkInDate: booking.check_in_date,
              checkOutDate: booking.check_out_date,
              roomType: booking.room_types?.name || 'Standard Room',
              adults: booking.adults,
              children: booking.children,
              totalPrice: booking.total_price,
              specialRequests: booking.special_requests
            }
          }
        );

        if (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the payment verification if email fails
        } else {
          console.log("Confirmation email sent successfully:", emailData);
        }
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
        // Don't fail the payment verification if email fails
      }

      return new Response(
        JSON.stringify({ 
          status: "paid",
          booking_confirmed: true 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log("Payment not completed, status:", session.payment_status);
      return new Response(
        JSON.stringify({ 
          status: session.payment_status,
          booking_confirmed: false 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
