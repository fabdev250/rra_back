// For demo purposes, we'll simulate SMS without actual Twilio calls
// Remove the actual Twilio implementation to avoid API costs during development

class SMSService {
  constructor() {
    // For demo, we'll just log SMS messages instead of sending real ones
    this.demoMode = true;
  }

  // Send payment confirmation to customer
  async sendPaymentConfirmation(customerPhone, productName, amount, taxAmount) {
    try {
      const message = `Thank you for your purchase! 🛍️\nProduct: ${productName}\nAmount: ${amount} RWF\nTax: ${taxAmount} RWF\nThank you for supporting Rwanda's development! 🇷🇼`;

      if (this.demoMode) {
        console.log(`📱 DEMO SMS to ${customerPhone}: ${message}`);
        return { success: true, messageId: 'DEMO_' + Date.now() };
      }

      // Actual Twilio implementation would go here
      // const result = await this.client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: customerPhone
      // });

      return { success: true, messageId: 'DEMO_' + Date.now() };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send trader notification
  async sendTraderNotification(traderPhone, productName, amount, traderAmount) {
    try {
      const message = `💰 Sale Recorded!\nProduct: ${productName}\nTotal: ${amount} RWF\nYou receive: ${traderAmount} RWF\nTax automatically paid to RRA.`;

      if (this.demoMode) {
        console.log(`📱 DEMO SMS to ${traderPhone}: ${message}`);
        return { success: true, messageId: 'DEMO_' + Date.now() };
      }

      // Actual Twilio implementation would go here
      // const result = await this.client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: traderPhone
      // });

      return { success: true, messageId: 'DEMO_' + Date.now() };
    } catch (error) {
      console.error('Trader SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send tax payment confirmation
  async sendTaxConfirmation(traderPhone, taxAmount, period) {
    try {
      const message = `📊 Tax Payment Confirmed!\nAmount: ${taxAmount} RWF\nPeriod: ${period}\nThank you for contributing to Rwanda's development!`;

      if (this.demoMode) {
        console.log(`📱 DEMO SMS to ${traderPhone}: ${message}`);
        return { success: true, messageId: 'DEMO_' + Date.now() };
      }

      // Actual Twilio implementation would go here
      // const result = await this.client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: traderPhone
      // });

      return { success: true, messageId: 'DEMO_' + Date.now() };
    } catch (error) {
      console.error('Tax confirmation SMS failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();