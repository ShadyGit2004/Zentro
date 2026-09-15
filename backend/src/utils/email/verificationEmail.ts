import { emailLayout } from "./emailLayout";

export const verificationEmail = (verificationUrl: string) => {
  const content = `
    <h1
      style="
        margin: 0 0 12px;
        font-size: 24px;
        line-height: 32px;
        font-weight: 700;
      "
    >
      Verify your email
    </h1>

    <p
      style="
        margin: 0 0 24px;
        color: #52525b;
        font-size: 15px;
        line-height: 24px;
      "
    >
      Thanks for joining Zentro. Please verify your email
      address to activate your account.
    </p>

    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="margin-bottom: 24px;"
    >
      <tr>
        <td
          align="center"
          style="
            border-radius: 8px;
            background-color: #18181b;
          "
        >
          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 12px 22px;
              color: #ffffff;
              font-size: 14px;
              font-weight: 600;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Verify email
          </a>
        </td>
      </tr>
    </table>

    <p
      style="
        margin: 0 0 8px;
        color: #71717a;
        font-size: 13px;
        line-height: 20px;
      "
    >
      If the button doesn't work, copy and paste this link
      into your browser:
    </p>

    <p
      style="
        margin: 0 0 24px;
        font-size: 12px;
        line-height: 18px;
        word-break: break-all;
      "
    >
      <a
        href="${verificationUrl}"
        style="color: #18181b;"
      >
        ${verificationUrl}
      </a>
    </p>

    <div
      style="
        padding: 12px 14px;
        background-color: #fafafa;
        border: 1px solid #e4e4e7;
        border-radius: 8px;
        color: #71717a;
        font-size: 12px;
        line-height: 18px;
      "
    >
      🔒 This verification link will expire for security reasons.
    </div>
  `;

  return emailLayout({
    title: "Verify your Zentro email",
    content,
  });
};