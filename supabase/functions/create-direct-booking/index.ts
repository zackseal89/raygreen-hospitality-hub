import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const bookingData = await req.json();
    console.log("Creating direct booking:", bookingData);
    console.log("Using updated validation function");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Validate booking data using the database function
    const { data: validation, error: validationError } = await supabaseClient.rpc(
      'validate_booking_data',
      {
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        special_requests: bookingData.specialRequests
      }
    );

    if (validationError || !validation?.valid) {
      console.error("Validation failed:", validation?.errors || validationError);
      throw new Error(`Validation failed: ${validation?.errors?.join(', ') || validationError?.message}`);
    }

    // Generate booking reference
    const bookingReference = `RGH${Date.now().toString().slice(-8)}`;

    // Create booking record
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        room_type_id: bookingData.roomTypeId,
        check_in_date: bookingData.checkInDate,
        check_out_date: bookingData.checkOutDate,
        num_guests: bookingData.numGuests,
        adults: bookingData.adults,
        children: bookingData.children,
        special_requests: bookingData.specialRequests,
        total_price: bookingData.totalPrice,
        booking_reference: bookingReference,
        status: "confirmed",
        payment_status: "pending"
      })
      .select(`
        *,
        room_types:room_type_id (
          name,
          base_price
        )
      `)
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      throw bookingError;
    }

    console.log("Booking created successfully:", booking.id);

    // Send guest confirmation email
    try {
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
      } else {
        console.log("Confirmation email sent successfully");
      }
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    // Send admin notification email
    try {
      const { data: adminEmailData, error: adminEmailError } = await supabaseClient.functions.invoke(
        'send-admin-booking-alert',
        {
          body: {
            guestName: booking.guest_name,
            guestEmail: booking.guest_email,
            guestPhone: booking.guest_phone,
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

      if (adminEmailError) {
        console.error("Error sending admin alert email:", adminEmailError);
      } else {
        console.log("Admin alert email sent successfully");
      }
    } catch (adminEmailErr) {
      console.error("Failed to send admin alert email:", adminEmailErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        message: "Booking confirmed successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating direct booking:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});