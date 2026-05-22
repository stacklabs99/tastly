import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Tastly <noreply@stacklabs.pt>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tastly.stacklabs.pt";

const superAdmins = (): string[] =>
  (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim()).filter(Boolean);

function wrap(content: string) {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <!-- Logo -->
        <tr><td style="padding-bottom:24px;text-align:center;">
          <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#c49516;letter-spacing:-0.5px;">Tastly</span>
        </td></tr>
        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;padding:36px 32px;border:1px solid #e8e8e0;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#b0a898;">&copy; ${new Date().getFullYear()} Tastly · <a href="${SITE_URL}" style="color:#b0a898;">tastly.stacklabs.pt</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Notificar admins quando novo utilizador se regista ────────────────────────

export async function sendNewRegistrationEmail(userEmail: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const to = superAdmins();
  if (to.length === 0) return;

  const adminUrl = `${SITE_URL}/admin/utilizadores`;

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1a1916;">Novo registo pendente</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#626250;line-height:1.6;">
      Um novo utilizador registou-se na plataforma e aguarda aprovação.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f4;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
      <tr>
        <td style="font-size:12px;color:#96967f;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:4px;">Email</td>
      </tr>
      <tr>
        <td style="font-size:15px;color:#1a1916;font-weight:500;">${userEmail}</td>
      </tr>
    </table>
    <a href="${adminUrl}" style="display:inline-block;background:#c49516;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">
      Aprovar utilizador
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#b0a898;">
      Ou acede a <a href="${adminUrl}" style="color:#c49516;">${adminUrl}</a>
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Novo registo pendente — ${userEmail}`,
    html,
  }).catch(() => null); // best-effort — não bloquear o fluxo
}

// ── Notificar utilizador quando aprovado ──────────────────────────────────────

export async function sendAccountApprovedEmail(userEmail: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const onboardingUrl = `${SITE_URL}/onboarding`;

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1a1916;">A tua conta foi aprovada!</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#626250;line-height:1.6;">
      Boas notícias! A equipa Tastly aprovou a tua conta.<br>
      Já podes configurar o teu restaurante e começar o trial gratuito de <strong>15 dias</strong>.
    </p>
    <a href="${onboardingUrl}" style="display:inline-block;background:#c49516;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">
      Configurar o meu restaurante
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:#96967f;line-height:1.6;">
      O trial de 15 dias começa quando criares o restaurante.<br>
      Sem cartão de crédito necessário.
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to: userEmail,
    subject: "A tua conta Tastly foi aprovada 🎉",
    html,
  }).catch(() => null);
}
