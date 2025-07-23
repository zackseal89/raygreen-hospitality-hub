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
    const { bookingData } = await req.json();
    
    if (!bookingData) {
      throw new Error("Booking data is required");
    }

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

    // Create the booking record first - map frontend fields to database schema
    const bookingRecord = {
      room_type_id: bookingData.room_type_id,
      check_in_date: bookingData.check_in_date,
      check_out_date: bookingData.check_out_date,
      guest_name: bookingData.guest_name,
      guest_email: bookingData.guest_email,
      guest_phone: bookingData.guest_phone,
      special_requests: bookingData.special_requests,
      total_price: bookingData.total_price,
      status: bookingData.status,
      user_id: bookingData.user_id,
      num_guests: (bookingData.adults || 0) + (bookingData.children || 0)
    };

    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert([bookingRecord])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Get room type details for email
    const { data: roomType, error: roomError } = await supabaseClient
      .from("room_types")
      .select("name")
      .eq("id", bookingData.room_type_id)
      .single();

    if (roomError) throw roomError;

    // Convert KES to USD for Stripe (approximate rate: 1 USD = 130 KES)
    const usdAmount = Math.round((bookingData.total_price / 130) * 100); // Convert to cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: bookingData.guest_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Hotel Booking - ${bookingData.guest_name}`,
              description: `${roomType.name} from ${bookingData.check_in_date} to ${bookingData.check_out_date}`,
            },
            unit_amount: usdAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/booking?cancelled=true`,
      metadata: {
        booking_id: booking.id,
      },
    });

    // Update booking with Stripe session ID
    await supabaseClient
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    // Send booking confirmation email
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          guestName: bookingData.guest_name,
          guestEmail: bookingData.guest_email,
          roomName: roomType.name,
          checkInDate: bookingData.check_in_date,
          checkOutDate: bookingData.check_out_date,
          adults: bookingData.adults,
          children: bookingData.children,
          totalPrice: bookingData.total_price,
          bookingId: booking.id,
          specialRequests: bookingData.special_requests,
        }),
      });
      console.log("Booking confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the whole booking if email fails
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        booking_id: booking.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});