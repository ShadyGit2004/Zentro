export const emailLayout = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${title}</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    font-family: Arial, Helvetica, sans-serif;
    color: #18181b;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f5f5f5; padding: 40px 16px;"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 560px;
            background-color: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 16px;
          "
        >
          <!-- Header -->
          <tr>
            <td
              align="center"
              style="padding: 32px 32px 20px;"
            >
              <div
                style="
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: -0.5px;
                "
              >
                Zentro
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 10px 32px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                border-top: 1px solid #f0f0f0;
                padding: 20px 32px;
                color: #71717a;
                font-size: 12px;
                line-height: 18px;
              "
            >
              © ${new Date().getFullYear()}2026 Zentro. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};