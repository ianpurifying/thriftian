// lib/services/emailService.ts
import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
});

const sender = new Sender(
  process.env.MAILERSEND_FROM_EMAIL || "",
  process.env.MAILERSEND_FROM_NAME || "Thriftian Marketplace"
);

export class EmailService {
  /**
   * Send order confirmation email with dynamic order details
   */
  async sendOrderConfirmation(
    to: string,
    toName: string,
    orderId: string,
    orderTotal: number,
    items: Array<{ title: string; quantity: number; price: number }>
  ): Promise<void> {
    // Convert items array to a string for email template
    const itemsList = items
      .map((item) => `${item.title} x${item.quantity} - ₱${item.price}`)
      .join("\n");

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([new Recipient(to, toName)])
      .setSubject("Order Confirmation - Thriftian Marketplace")
      .setTemplateId(process.env.MAILERSEND_TEMPLATE_ORDER_CONFIRMATION || "")
      .setPersonalization([
        {
          email: to,
          data: {
            order_id: orderId,
            order_total: orderTotal.toString(),
            buyer_name: toName,
            items: itemsList,
          },
        },
      ]);

    await mailerSend.email.send(emailParams);
  }

  /**
   * Send tracking update email
   */
  async sendTrackingUpdate(
    to: string,
    toName: string,
    orderId: string,
    trackingNumber: string
  ): Promise<void> {
    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([new Recipient(to, toName)])
      .setSubject("Your Order Has Shipped - Thriftian Marketplace")
      .setTemplateId(process.env.MAILERSEND_TEMPLATE_TRACKING_UPDATE || "")
      .setPersonalization([
        {
          email: to,
          data: {
            order_id: orderId,
            tracking_number: trackingNumber,
            buyer_name: toName,
          },
        },
      ]);

    await mailerSend.email.send(emailParams);
  }

  /**
   * Send dispute alert email
   */
  async sendDisputeAlert(
    to: string,
    toName: string,
    orderId: string,
    reason: string
  ): Promise<void> {
    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([new Recipient(to, toName)])
      .setSubject("Dispute Opened - Thriftian Marketplace")
      .setTemplateId(process.env.MAILERSEND_TEMPLATE_DISPUTE_ALERT || "")
      .setPersonalization([
        {
          email: to,
          data: {
            order_id: orderId,
            reason,
            recipient_name: toName,
          },
        },
      ]);

    await mailerSend.email.send(emailParams);
  }

  /**
   * Send a generic email without a template
   */
  async sendGenericEmail(
    to: string,
    toName: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {
    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([new Recipient(to, toName)])
      .setSubject(subject)
      .setHtml(htmlContent);

    await mailerSend.email.send(emailParams);
  }
}

// Singleton instance for convenience
export const emailService = new EmailService();
