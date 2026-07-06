import { Resend } from 'resend';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactFormBody = {
  name: string;
  email: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const { name, email, message }: ContactFormBody = await request.json();

    // Save a permanent copy of the message in the database
    await supabaseAdmin.from('contact_messages').insert({ name, email, message });

    // Send the actual email to the shop's real inbox
    await resend.emails.send({
      from: 'Vintage Shop <onboarding@resend.dev>', // swap for your own domain once verified
      to: [process.env.SHOP_CONTACT_EMAIL as string],
      replyTo: email, // lets the shop owner just hit "reply" to answer the customer directly
      subject: `New message from ${name}`,
      text: message,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}