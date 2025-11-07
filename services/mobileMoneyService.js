class MobileMoneyService {
  // Simulate MTN Mobile Money payment
  async processMTNPayment(amount, customerPhone, merchantPhone) {
    try {
      // In real implementation, this would call MTN MoMo API
      console.log(`Processing MTN MoMo payment: ${amount} RWF from ${customerPhone} to ${merchantPhone}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const transactionId = 'MTN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return {
          success: true,
          transactionId,
          amount,
          customerPhone,
          merchantPhone,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: 'Payment failed: Insufficient funds or network error'
        };
      }
    } catch (error) {
      console.error('MTN MoMo payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulate Airtel Money payment
  async processAirtelPayment(amount, customerPhone, merchantPhone) {
    try {
      console.log(`Processing Airtel Money payment: ${amount} RWF from ${customerPhone} to ${merchantPhone}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const transactionId = 'AIRTEL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return {
          success: true,
          transactionId,
          amount,
          customerPhone,
          merchantPhone,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: 'Payment failed: Insufficient funds or network error'
        };
      }
    } catch (error) {
      console.error('Airtel Money payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Split payment between trader and tax account
  splitPayment(totalAmount, taxRate = 2.0) {
    const taxAmount = (totalAmount * taxRate) / 100;
    const traderAmount = totalAmount - taxAmount;
    
    return {
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      traderAmount: parseFloat(traderAmount.toFixed(2)),
      taxRate
    };
  }
}

module.exports = new MobileMoneyService();