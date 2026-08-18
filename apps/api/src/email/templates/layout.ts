export function wrapEmail(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#1e293b;padding:20px 32px;">
                <span style="color:#ffffff;font-size:16px;font-weight:600;">Editora · Lançamento de Trabalhos</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1f2937;font-size:14px;line-height:1.6;">
                <h1 style="font-size:18px;margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;">
                Este é um e-mail automático do sistema de lançamento de trabalhos.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
