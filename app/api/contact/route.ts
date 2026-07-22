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


    await supabaseAdmin.from('contact_messages').insert({ name, email, message });

    await resend.emails.send({
      from: 'The Old Attic <orders@theoldattic-shop.com>',
      to: [process.env.SHOP_CONTACT_EMAIL as string],
      replyTo: email,
      subject: `New message from ${name}`,
      text: message,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}