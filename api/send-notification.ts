import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Ces variables sont SANS pr\u00e9fixe VITE_ (c\u00f4t\u00e9 serveur)
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "" // service_role pour bypass RLS
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { clientName, service, date, time } = req.body;

    // Lire l'email de notification depuis la DB
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "notification_email")
      .single();

    if (!setting?.value) {
      return res.status(200).json({ message: "No notification email configured" });
    }

    await resend.emails.send({
      from: "Auto-Blog <onboarding@resend.dev>",
      to: setting.value,
      subject: `Nouvelle r\u00e9servation - ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #CF5C36; padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nouvelle r\u00e9servation</h1>
          </div>
          <div style="background-color: #FCFAF8; padding: 24px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
            <p style="color: #4B5563;"><strong>Client :</strong> ${clientName}</p>
            <p style="color: #4B5563;"><strong>Service :</strong> ${service}</p>
            <p style="color: #4B5563;"><strong>Date :</strong> ${date} \u00e0 ${time}</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ message: "Notification sent" });
  } catch (err) {
    console.error("Notification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
