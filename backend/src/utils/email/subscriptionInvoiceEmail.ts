import { emailLayout } from "./emailLayout";

interface SubscriptionInvoiceEmailInput {
  displayName: string;
  plan: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  providerPaymentId: string;
  providerOrderId: string;
  periodStart: Date;
  periodEnd: Date;
}

const subscriptionInvoiceEmail = ({
  displayName,
  plan,
  amount,
  currency,
  paymentDate,
  providerPaymentId,
  providerOrderId,
  periodStart,
  periodEnd,
}: SubscriptionInvoiceEmailInput): string => {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const content = `
    <!-- Success indicator -->
    <div
      style="
        width: 48px;
        height: 48px;
        margin-bottom: 20px;
        border-radius: 50%;
        background-color: #f4f4f5;
        text-align: center;
        line-height: 48px;
        font-size: 22px;
      "
    >
      ✓
    </div>

    <h1
      style="
        margin: 0 0 10px;
        font-size: 26px;
        line-height: 34px;
        font-weight: 700;
        letter-spacing: -0.5px;
      "
    >
      You're all set, ${displayName}!
    </h1>

    <p
      style="
        margin: 0 0 26px;
        color: #52525b;
        font-size: 15px;
        line-height: 24px;
      "
    >
      Your Zentro subscription is now active. Thanks for being
      part of the community.
    </p>

    <!-- Amount highlight -->
    <div
      style="
        margin-bottom: 24px;
        padding: 20px;
        background-color: #fafafa;
        border: 1px solid #e4e4e7;
        border-radius: 12px;
        text-align: center;
      "
    >
      <p
        style="
          margin: 0 0 6px;
          color: #71717a;
          font-size: 12px;
          line-height: 18px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 600;
        "
      >
        Amount paid
      </p>

      <p
        style="
          margin: 0;
          color: #18181b;
          font-size: 30px;
          line-height: 38px;
          font-weight: 700;
          letter-spacing: -0.5px;
        "
      >
        ${formattedAmount}
      </p>

      <p
        style="
          margin: 6px 0 0;
          color: #71717a;
          font-size: 13px;
          line-height: 20px;
        "
      >
        ${plan} plan
      </p>
    </div>

    <!-- Subscription -->
    <div
      style="
        margin-bottom: 24px;
        padding: 18px;
        border: 1px solid #e4e4e7;
        border-radius: 12px;
      "
    >
      <p
        style="
          margin: 0 0 14px;
          color: #18181b;
          font-size: 15px;
          line-height: 22px;
          font-weight: 700;
        "
      >
        Subscription details
      </p>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
      >
        <tr>
          <td
            style="
              padding-bottom: 10px;
              color: #71717a;
              font-size: 13px;
            "
          >
            Plan
          </td>

          <td
            align="right"
            style="
              padding-bottom: 10px;
              color: #18181b;
              font-size: 13px;
              font-weight: 600;
            "
          >
            ${plan}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding-bottom: 10px;
              color: #71717a;
              font-size: 13px;
            "
          >
            Billing
          </td>

          <td
            align="right"
            style="
              padding-bottom: 10px;
              color: #18181b;
              font-size: 13px;
            "
          >
            Monthly
          </td>
        </tr>

        <tr>
          <td
            style="
              color: #71717a;
              font-size: 13px;
            "
          >
            Valid until
          </td>

          <td
            align="right"
            style="
              color: #18181b;
              font-size: 13px;
              font-weight: 600;
            "
          >
            ${formatDate(periodEnd)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Payment details -->
    <div
      style="
        margin-bottom: 24px;
        padding: 18px;
        background-color: #fafafa;
        border: 1px solid #e4e4e7;
        border-radius: 12px;
      "
    >
      <p
        style="
          margin: 0 0 14px;
          color: #18181b;
          font-size: 15px;
          line-height: 22px;
          font-weight: 700;
        "
      >
        Payment details
      </p>

      <p
        style="
          margin: 0 0 8px;
          color: #71717a;
          font-size: 12px;
          line-height: 18px;
        "
      >
        Payment date
      </p>

      <p
        style="
          margin: 0 0 14px;
          color: #18181b;
          font-size: 13px;
          line-height: 20px;
        "
      >
        ${formatDate(paymentDate)}
      </p>

      <p
        style="
          margin: 0 0 8px;
          color: #71717a;
          font-size: 12px;
          line-height: 18px;
        "
      >
        Payment ID
      </p>

      <p
        style="
          margin: 0 0 14px;
          color: #18181b;
          font-size: 12px;
          line-height: 18px;
          word-break: break-all;
        "
      >
        ${providerPaymentId}
      </p>

      <p
        style="
          margin: 0 0 8px;
          color: #71717a;
          font-size: 12px;
          line-height: 18px;
        "
      >
        Order ID
      </p>

      <p
        style="
          margin: 0;
          color: #18181b;
          font-size: 12px;
          line-height: 18px;
          word-break: break-all;
        "
      >
        ${providerOrderId}
      </p>
    </div>

    <!-- Closing message -->
    <div
      style="
        padding: 14px 16px;
        background-color: #fafafa;
        border: 1px solid #e4e4e7;
        border-radius: 10px;
      "
    >
      <p
        style="
          margin: 0;
          color: #52525b;
          font-size: 13px;
          line-height: 21px;
        "
      >
        Thanks for choosing Zentro. We hope you enjoy the
        experience and make the most of your subscription.
      </p>
    </div>
  `;

  return emailLayout({
    title: "Your Zentro subscription is active",
    content,
  });
};

export { subscriptionInvoiceEmail };
