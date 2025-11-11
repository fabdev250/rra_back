const db = require('../models');
const { Trader, Transaction, District, Sector } = require('../models');
const bcrypt = require('bcryptjs');

// Initialize global session storage
if (!global.ussdSessions) {
  global.ussdSessions = new Map();
}

// Constants
const USSD_CODE = '*384*36920#';
const TAX_RATE = 0.18; // 18% VAT for Rwanda

// Trader categories for Rwanda
const TRADER_CATEGORIES = {
  '1': 'Retail Shop',
  '2': 'Restaurant',
  '3': 'Market Vendor',
  '4': 'Service Provider',
  '5': 'Wholesaler',
  '6': 'Other'
};

// Default districts and sectors in case database is empty
const DEFAULT_DISTRICTS = [
  { id: 1, name: 'Kigali City' },
  { id: 2, name: 'Northern Province' },
  { id: 3, name: 'Southern Province' },
  { id: 4, name: 'Eastern Province' },
  { id: 5, name: 'Western Province' }
];

const DEFAULT_SECTORS = {
  1: [
    { id: 1, name: 'Nyarugenge' },
    { id: 2, name: 'Gasabo' },
    { id: 3, name: 'Kicukiro' }
  ],
  2: [
    { id: 4, name: 'Burera' },
    { id: 5, name: 'Gakenke' },
    { id: 6, name: 'Gicumbi' },
    { id: 7, name: 'Musanze' },
    { id: 8, name: 'Rulindo' }
  ],
  3: [
    { id: 9, name: 'Gisagara' },
    { id: 10, name: 'Huye' },
    { id: 11, name: 'Kamonyi' },
    { id: 12, name: 'Muhanga' },
    { id: 13, name: 'Nyamagabe' },
    { id: 14, name: 'Nyanza' },
    { id: 15, name: 'Nyaruguru' },
    { id: 16, name: 'Ruhango' }
  ],
  4: [
    { id: 17, name: 'Bugesera' },
    { id: 18, name: 'Gatsibo' },
    { id: 19, name: 'Kayonza' },
    { id: 20, name: 'Kirehe' },
    { id: 21, name: 'Ngoma' },
    { id: 22, name: 'Nyagatare' },
    { id: 23, name: 'Rwamagana' }
  ],
  5: [
    { id: 24, name: 'Karongi' },
    { id: 25, name: 'Ngororero' },
    { id: 26, name: 'Nyabihu' },
    { id: 27, name: 'Nyamasheke' },
    { id: 28, name: 'Rubavu' },
    { id: 29, name: 'Rusizi' },
    { id: 30, name: 'Rutsiro' }
  ]
};

// Error messages
const ERROR_MESSAGES = {
  MISSING_PHONE: 'END Missing phone number',
  TRADER_NOT_FOUND: 'END Trader account not found. Please register first.',
  INVALID_OPTION: 'END Invalid option selected',
  SYSTEM_ERROR: 'END System error. Please try again later.',
  DB_UNAVAILABLE: 'END System temporarily unavailable. Please try again later.'
};

// Session Management
class SessionManager {
  static getSession(sessionKey) {
    return global.ussdSessions.get(sessionKey);
  }

  static setSession(sessionKey, sessionData) {
    global.ussdSessions.set(sessionKey, sessionData);
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      global.ussdSessions.delete(sessionKey);
    }, 10 * 60 * 1000);
  }

  static initializeSession(phoneNumber) {
    return {
      phoneNumber: phoneNumber,
      registrationStep: 0,
      loginStep: 0,
      paymentStep: 0,
      currentTrader: null,
      tempData: {}
    };
  }
}

// USSD Menu Handler
class USSDMenu {
  static mainMenu(isRegistered = false) {
    if (isRegistered) {
      return `CON SmartTax Rwanda 🇷🇼
1. Pay Tax
2. My Transactions
3. Account Balance
4. My Profile
5. Help
0. Exit`;
    } else {
      return `CON Welcome to SmartTax Rwanda 🇷🇼
1. Register as Trader
2. Login
3. About SmartTax
0. Exit`;
    }
  }

  static categoryMenu() {
    return `CON Select your business category:
1. Retail Shop
2. Restaurant 
3. Market Vendor
4. Service Provider
5. Wholesaler
6. Other`;
  }

  static helpMenu() {
    return `END SmartTax Rwanda Support:
📞 Call: 3000
📧 Email: support@smarttax.gov.rw
🌐 Website: smarttax.gov.rw

Thank you for using SmartTax!`;
  }

  static aboutMenu() {
    return `END SmartTax Rwanda:
Digital tax system for traders
Pay taxes via USSD easily
Stay compliant with RRA

Dial ${USSD_CODE} to start`;
  }
}

// Database Operations with fallback
class TraderService {
  static async findTraderByPhone(phoneNumber) {
    try {
      let trader = await Trader.findOne({ 
        where: { phone: phoneNumber }
      });

      // Try to include associations if they exist
      if (trader) {
        try {
          trader = await Trader.findOne({
            where: { phone: phoneNumber },
            include: [
              { model: District, attributes: ['id', 'name'] },
              { model: Sector, attributes: ['id', 'name'] }
            ]
          });
        } catch (associationError) {
          console.log('Association error, using basic trader data:', associationError.message);
          // Continue with basic trader data without associations
        }
      }
      
      return trader;
    } catch (error) {
      console.error('Error finding trader:', error);
      return null;
    }
  }

  static async createTrader(traderData) {
    try {
      // Hash the PIN before saving
      if (traderData.pin) {
        const saltRounds = 10;
        traderData.pin_hash = await bcrypt.hash(traderData.pin, saltRounds);
        delete traderData.pin; // Remove plain text PIN
      }

      // Ensure required fields have values
      if (!traderData.business_name) {
        traderData.business_name = `${traderData.full_name} - ${traderData.category}`;
      }
      if (!traderData.tin_number) {
        traderData.tin_number = `TIN-${Date.now().toString().slice(-8)}`;
      }
      if (traderData.district_id === undefined) {
        traderData.district_id = 1; // Default to Kigali
      }
      if (traderData.sector_id === undefined) {
        traderData.sector_id = 1; // Default to first sector
      }
      if (traderData.is_active === undefined) {
        traderData.is_active = true;
      }

      return await Trader.create(traderData);
    } catch (error) {
      console.error('Error creating trader:', error);
      throw error;
    }
  }

  static async verifyPin(trader, inputPin) {
    try {
      if (!trader.pin_hash) return false;
      return await bcrypt.compare(inputPin, trader.pin_hash);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  static async createTransaction(transactionData) {
    try {
      // Ensure all required transaction fields are present
      const completeTransactionData = {
        ...transactionData,
        status: transactionData.status || 'completed',
        transaction_type: transactionData.transaction_type || 'tax_payment',
        payment_method: transactionData.payment_method || 'ussd',
        reference_number: transactionData.reference_number || `REF-${Date.now()}`,
        // Add other potential required fields with defaults
        product_quantity: transactionData.product_quantity || 1,
        unit_price: transactionData.unit_price || transactionData.product_price,
        vat_rate: transactionData.vat_rate || TAX_RATE
      };

      console.log('Creating transaction with data:', completeTransactionData);
      return await Transaction.create(completeTransactionData);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async getTraderTransactions(traderId) {
    try {
      return await Transaction.findAll({
        where: { trader_id: traderId },
        order: [['createdAt', 'DESC']],
        limit: 5
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async getTraderStats(traderId) {
    try {
      const totalTransactions = await Transaction.count({
        where: { trader_id: traderId }
      });

      const totalRevenue = await Transaction.sum('product_price', {
        where: { trader_id: traderId }
      }) || 0;

      const totalTax = await Transaction.sum('tax_amount', {
        where: { trader_id: traderId }
      }) || 0;

      const totalTraderAmount = await Transaction.sum('trader_amount', {
        where: { trader_id: traderId }
      }) || 0;

      return {
        totalTransactions,
        totalRevenue,
        totalTax,
        totalTraderAmount
      };
    } catch (error) {
      console.error('Error getting trader stats:', error);
      return { totalTransactions: 0, totalRevenue: 0, totalTax: 0, totalTraderAmount: 0 };
    }
  }

  static async getDistricts() {
    try {
      const districts = await District.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });
      
      // Use default districts if database is empty
      if (!districts || districts.length === 0) {
        console.log('Using default districts');
        return DEFAULT_DISTRICTS;
      }
      
      return districts;
    } catch (error) {
      console.error('Error getting districts, using defaults:', error.message);
      return DEFAULT_DISTRICTS;
    }
  }

  static async getSectorsByDistrict(districtId) {
    try {
      const sectors = await Sector.findAll({
        where: { district_id: districtId },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });
      
      // Use default sectors if database is empty or error
      if (!sectors || sectors.length === 0) {
        console.log(`Using default sectors for district ${districtId}`);
        return DEFAULT_SECTORS[districtId] || DEFAULT_SECTORS[1] || [];
      }
      
      return sectors;
    } catch (error) {
      console.error('Error getting sectors, using defaults:', error.message);
      return DEFAULT_SECTORS[districtId] || DEFAULT_SECTORS[1] || [];
    }
  }

  static async formatDistrictsMenu(districts) {
    let menu = 'CON Select your district:\n';
    districts.forEach((district, index) => {
      menu += `${index + 1}. ${district.name}\n`;
    });
    return menu;
  }

  static async formatSectorsMenu(sectors) {
    if (!sectors || sectors.length === 0) {
      return 'CON No sectors available. Please contact support.';
    }
    
    let menu = 'CON Select your sector:\n';
    sectors.forEach((sector, index) => {
      menu += `${index + 1}. ${sector.name}\n`;
    });
    return menu;
  }
}

// USSD Session Middleware
exports.ussdSession = async (req, res, next) => {
  try {
    const { sessionId, phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.send(ERROR_MESSAGES.MISSING_PHONE);
    }

    const sessionKey = sessionId || phoneNumber;
    let session = SessionManager.getSession(sessionKey);

    if (!session) {
      session = SessionManager.initializeSession(phoneNumber);
      
      // Check if trader exists
      try {
        const existingTrader = await TraderService.findTraderByPhone(phoneNumber);
        if (existingTrader) {
          session.currentTrader = existingTrader;
          session.isRegistered = true;
        }
      } catch (error) {
        console.error('Error checking trader existence:', error);
        // Continue without trader data
      }
    }

    req.session = session;
    req.sessionKey = sessionKey;
    
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    req.session = SessionManager.initializeSession(req.body.phoneNumber || 'unknown');
    next();
  }
};

// Main USSD Controller
exports.processUSSD = async (req, res) => {
  try {
    const { phoneNumber, text } = req.body;
    const session = req.session;
    const sessionKey = req.sessionKey;

    console.log('USSD Request:', { phoneNumber, text, session });

    if (!phoneNumber) {
      return res.send(ERROR_MESSAGES.MISSING_PHONE);
    }

    const userInput = text ? text.split('*') : [];
    const currentStep = userInput.length;
    const currentChoice = userInput[currentStep - 1];

    let response = '';

    // Main menu flow
    if (currentStep === 0) {
      response = USSDMenu.mainMenu(session.isRegistered);
    } else {
      if (session.isRegistered) {
        // Registered user flow
        response = await handleRegisteredUserFlow(session, userInput, currentStep, currentChoice);
      } else {
        // New user flow
        response = await handleNewUserFlow(session, userInput, currentStep, currentChoice, phoneNumber);
      }
    }

    // Update session
    SessionManager.setSession(sessionKey, session);

    console.log('USSD Response:', response);
    res.set('Content-Type', 'text/plain');
    res.send(response);

  } catch (error) {
    console.error('USSD Processing Error:', error);
    res.set('Content-Type', 'text/plain');
    res.send(ERROR_MESSAGES.SYSTEM_ERROR);
  }
};

// Handle registered users
async function handleRegisteredUserFlow(session, userInput, currentStep, currentChoice) {
  const trader = session.currentTrader;

  switch (currentStep) {
    case 1:
      switch (currentChoice) {
        case '1': // Pay Tax
          session.paymentStep = 1;
          return 'CON Enter product/service name:';

        case '2': // My Transactions
          const transactions = await TraderService.getTraderTransactions(trader.id);
          if (transactions.length === 0) {
            return 'END No transactions found.';
          }
          
          let txList = 'END Recent Transactions:\n';
          transactions.forEach((tx, index) => {
            txList += `${index + 1}. ${tx.product_name || 'Transaction'}\n`;
            txList += `   Price: RWF ${(tx.product_price || 0).toLocaleString()}\n`;
            txList += `   Tax: RWF ${(tx.tax_amount || 0).toLocaleString()}\n`;
            txList += `   Trader: RWF ${(tx.trader_amount || 0).toLocaleString()}\n`;
            txList += `   Date: ${new Date(tx.createdAt).toLocaleDateString()}\n\n`;
          });
          return txList;

        case '3': // Account Balance
          const stats = await TraderService.getTraderStats(trader.id);
          return `END Your Tax Summary:
💰 Total Sales: RWF ${stats.totalRevenue.toLocaleString()}
🏛️ Total Tax Paid: RWF ${stats.totalTax.toLocaleString()}
👤 Your Earnings: RWF ${stats.totalTraderAmount.toLocaleString()}
📈 Transactions: ${stats.totalTransactions}

Thank you for being compliant!`;

        case '4': // My Profile
          let districtName = 'Not set';
          let sectorName = 'Not set';
          
          // Safely get district and sector names
          try {
            districtName = trader.District ? trader.District.name : 
                          (trader.district_name || 'Not set');
            sectorName = trader.Sector ? trader.Sector.name : 
                        (trader.sector_name || 'Not set');
          } catch (error) {
            console.error('Error getting location names:', error);
          }
          
          return `END Your Profile:
👤 Name: ${trader.full_name}
🏢 Business: ${trader.business_name}
📍 District: ${districtName}
📍 Sector: ${sectorName}
📞 Phone: ${trader.phone}
📱 Momo: ${trader.momo_number}
📧 Email: ${trader.email || 'Not set'}
🏷️ Category: ${trader.category}
🆔 TIN: ${trader.tin_number}

Dial ${USSD_CODE} for more options`;

        case '5': // Help
          return USSDMenu.helpMenu();

        case '0': // Exit
          return 'END Thank you for using SmartTax Rwanda!';

        default:
          return ERROR_MESSAGES.INVALID_OPTION;
      }

    case 2: // Payment flow - product name entered
      if (session.paymentStep === 1) {
        session.tempData.productName = currentChoice;
        session.paymentStep = 2;
        return 'CON Enter product price (RWF):';
      }
      break;

    case 3: // Payment flow - amount entered
      if (session.paymentStep === 2) {
        const productPrice = parseFloat(currentChoice);
        if (isNaN(productPrice) || productPrice <= 0) {
          return 'END Invalid amount. Please start again.';
        }

        // Calculate tax and trader amount
        const taxAmount = productPrice * TAX_RATE;
        const traderAmount = productPrice - taxAmount; // Money the trader keeps

        // Create transaction with all required fields
        try {
          await TraderService.createTransaction({
            trader_id: trader.id,
            product_name: session.tempData.productName,
            product_price: productPrice, // Original product price
            tax_amount: taxAmount,       // Tax to pay (18%)
            trader_amount: traderAmount, // Money trader keeps (82%)
            total_amount: productPrice,  // Total transaction amount
            transaction_type: 'tax_payment',
            payment_method: 'ussd',
            reference_number: `TX-${Date.now()}-${trader.id}`,
            status: 'completed',
            product_quantity: 1,
            unit_price: productPrice,
            vat_rate: TAX_RATE
          });

          return `END ✅ Tax Payment Successful!

📦 Product: ${session.tempData.productName}
💰 Product Price: RWF ${productPrice.toLocaleString()}
🏛️ VAT Tax (18%): RWF ${taxAmount.toLocaleString()}
👤 Your Earnings: RWF ${traderAmount.toLocaleString()}

Breakdown:
• You receive: RWF ${traderAmount.toLocaleString()}
• Tax paid: RWF ${taxAmount.toLocaleString()}
• Total: RWF ${productPrice.toLocaleString()}

Receipt sent to your phone.`;

        } catch (error) {
          console.error('Transaction creation error:', error);
          return 'END Payment failed. Please try again. Error: ' + error.message;
        }
      }
      break;

    default:
      return ERROR_MESSAGES.INVALID_OPTION;
  }

  return ERROR_MESSAGES.INVALID_OPTION;
}

// Handle new users
async function handleNewUserFlow(session, userInput, currentStep, currentChoice, phoneNumber) {
  switch (currentStep) {
    case 1:
      switch (currentChoice) {
        case '1': // Register
          session.registrationStep = 1;
          return 'CON Enter your full name:';

        case '2': // Login
          const existingTrader = await TraderService.findTraderByPhone(phoneNumber);
          if (!existingTrader) {
            return 'END Account not found. Please register first.';
          }
          session.loginStep = 1;
          return 'CON Enter your 4-digit PIN:';

        case '3': // About
          return USSDMenu.aboutMenu();

        case '0': // Exit
          return 'END Thank you for your interest in SmartTax Rwanda!';

        default:
          return ERROR_MESSAGES.INVALID_OPTION;
      }

    case 2: 
      if (session.registrationStep === 1) {
        // Registration - full name entered
        session.tempData.full_name = currentChoice;
        session.registrationStep = 2;
        return 'CON Enter your email address:';
      } else if (session.loginStep === 1) {
        // Login - PIN entered
        const trader = await TraderService.findTraderByPhone(phoneNumber);
        if (trader) {
          const isPinValid = await TraderService.verifyPin(trader, currentChoice);
          if (isPinValid) {
            session.currentTrader = trader;
            session.isRegistered = true;
            return `END ✅ Login Successful!
Welcome back, ${trader.full_name}!

Dial ${USSD_CODE} to access your account.`;
          } else {
            return 'END Invalid PIN. Please try again.';
          }
        }
        return ERROR_MESSAGES.TRADER_NOT_FOUND;
      }
      break;

    case 3: 
      if (session.registrationStep === 2) {
        // Registration - email entered
        session.tempData.email = currentChoice;
        session.registrationStep = 3;
        // Use phone number as momo number by default
        session.tempData.momo_number = phoneNumber;
        
        // Load districts for selection
        try {
          const districts = await TraderService.getDistricts();
          if (districts.length === 0) {
            return 'END System error: No districts available. Please try later.';
          }
          
          session.tempData.districts = districts;
          return await TraderService.formatDistrictsMenu(districts);
        } catch (error) {
          console.error('Error loading districts:', error);
          return ERROR_MESSAGES.DB_UNAVAILABLE;
        }
      }
      break;

    case 4:
      if (session.registrationStep === 3) {
        // Registration - district selected
        const districtIndex = parseInt(currentChoice) - 1;
        const districts = session.tempData.districts;
        
        if (districtIndex < 0 || districtIndex >= districts.length) {
          return 'END Invalid district selection. Please start again.';
        }
        
        const selectedDistrict = districts[districtIndex];
        session.tempData.district_id = selectedDistrict.id;
        session.tempData.district_name = selectedDistrict.name;
        session.registrationStep = 4;
        
        // Load sectors for selected district
        try {
          const sectors = await TraderService.getSectorsByDistrict(selectedDistrict.id);
          if (sectors.length === 0) {
            return 'END No sectors available for selected district. Please try another district.';
          }
          
          session.tempData.sectors = sectors;
          return await TraderService.formatSectorsMenu(sectors);
        } catch (error) {
          console.error('Error loading sectors:', error);
          return ERROR_MESSAGES.DB_UNAVAILABLE;
        }
      }
      break;

    case 5:
      if (session.registrationStep === 4) {
        // Registration - sector selected
        const sectorIndex = parseInt(currentChoice) - 1;
        const sectors = session.tempData.sectors;
        
        if (sectorIndex < 0 || sectorIndex >= sectors.length) {
          return 'END Invalid sector selection. Please start again.';
        }
        
        const selectedSector = sectors[sectorIndex];
        session.tempData.sector_id = selectedSector.id;
        session.tempData.sector_name = selectedSector.name;
        session.registrationStep = 5;
        return USSDMenu.categoryMenu();
      }
      break;

    case 6:
      if (session.registrationStep === 5) {
        // Registration - category selected
        const selectedCategory = TRADER_CATEGORIES[currentChoice];
        if (!selectedCategory) {
          return 'END Invalid category. Please start again.';
        }
        session.tempData.category = selectedCategory;
        session.registrationStep = 6;
        return 'CON Create a 4-digit PIN:';
      }
      break;

    case 7: // Registration - PIN entered
      if (session.registrationStep === 6) {
        if (currentChoice.length !== 4 || isNaN(currentChoice)) {
          return 'END Invalid PIN. Must be 4 digits. Start again.';
        }

        // Check if phone already registered
        const existingTrader = await TraderService.findTraderByPhone(phoneNumber);
        if (existingTrader) {
          return 'END Phone number already registered. Please login instead.';
        }

        // Create trader account with all required fields
        try {
          const newTrader = await TraderService.createTrader({
            full_name: session.tempData.full_name,
            phone: phoneNumber,
            email: session.tempData.email,
            momo_number: session.tempData.momo_number,
            category: session.tempData.category,
            business_name: `${session.tempData.full_name} - ${session.tempData.category}`,
            tin_number: `TIN-${Date.now().toString().slice(-8)}`,
            district_id: session.tempData.district_id,
            sector_id: session.tempData.sector_id,
            is_active: true,
            pin: currentChoice
          });

          session.currentTrader = newTrader;
          session.isRegistered = true;

          return `END ✅ Registration Successful!
Welcome to SmartTax Rwanda!

👤 Name: ${session.tempData.full_name}
🏢 Category: ${session.tempData.category}
📍 District: ${session.tempData.district_name}
📍 Sector: ${session.tempData.sector_name}
📞 Phone: ${phoneNumber}
📱 Momo: ${session.tempData.momo_number}
🆔 TIN: ${newTrader.tin_number}

You can now:
• Pay taxes via USSD
• View your transactions  
• Check your tax balance

Dial ${USSD_CODE} to continue`;

        } catch (error) {
          console.error('Registration error details:', error);
          return 'END Registration failed. Please try again. Error: ' + error.message;
        }
      }
      break;

    default:
      return ERROR_MESSAGES.INVALID_OPTION;
  }

  return ERROR_MESSAGES.INVALID_OPTION;
}