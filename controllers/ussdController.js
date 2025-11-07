const { User, Tax } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.processUSSD = async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });

    let response = '';

    if (text === '') {
      // First menu - Check if user exists
      const existingUser = await User.findOne({ where: { phone: phoneNumber } });
      
      if (existingUser) {
        // User exists - show main menu
        response = `CON Welcome back ${existingUser.username}!
1. Pay Tax
2. Check Balance
3. Recent Transactions
4. My Profile
5. Help`;
      } else {
        // New user - show registration option
        response = `CON Welcome to SmartTax Trader
1. Register New Account
2. Login
3. Help`;
      }
    } else {
      const textArray = text.split('*');
      const step = textArray.length;
      const userInput = textArray[step - 1];

      // Get user session data
      const userSession = req.session || {};

      switch (step) {
        case 1:
          switch (userInput) {
            case '1':
              if (!userSession.userExists) {
                // Registration flow
                response = `CON Create Your Account
Enter your username:`;
              } else {
                // Pay tax flow for existing users
                response = `CON Enter Product Name:`;
              }
              break;
            case '2':
              if (!userSession.userExists) {
                // Login flow
                response = `CON Enter your password:`;
                userSession.loginFlow = true;
              } else {
                // Check balance for existing users
                const user = await User.findOne({ where: { phone: phoneNumber } });
                if (user) {
                  const totalTaxes = await Tax.sum('taxAmount', { where: { UserId: user.id } }) || 0;
                  const totalRevenue = await Tax.sum('price', { where: { UserId: user.id } }) || 0;
                  const totalTransactions = await Tax.count({ where: { UserId: user.id } });
                  
                  response = `END Your Tax Summary:
Total Revenue: ₵${totalRevenue.toFixed(2)}
Total Taxes Paid: ₵${totalTaxes.toFixed(2)}
Total Transactions: ${totalTransactions}`;
                }
              }
              break;
            case '3':
              if (!userSession.userExists) {
                response = `END SmartTax Trader USSD Help:
- Register: Create new account
- Login: Access existing account
- Support: support@smarttax.com
Visit: smarttax.com`;
              } else {
                // Recent transactions for existing users
                const user = await User.findOne({ where: { phone: phoneNumber } });
                if (user) {
                  const recentTaxes = await Tax.findAll({ 
                    where: { UserId: user.id },
                    order: [['createdAt', 'DESC']],
                    limit: 3
                  });
                  
                  if (recentTaxes.length === 0) {
                    response = `END No transactions found.`;
                  } else {
                    let txList = 'END Recent Transactions:\n';
                    recentTaxes.forEach((tax, index) => {
                      txList += `${index + 1}. ${tax.productName}\n   Amount: ₵${tax.totalAmount}\n   Tax: ₵${tax.taxAmount}\n   Date: ${new Date(tax.createdAt).toLocaleDateString()}\n\n`;
                    });
                    response = txList;
                  }
                }
              }
              break;
            case '4':
              if (userSession.userExists) {
                // My Profile for existing users
                const user = await User.findOne({ where: { phone: phoneNumber } });
                if (user) {
                  response = `END My Profile:
Username: ${user.username}
Email: ${user.email}
Phone: ${user.phone}
Joined: ${new Date(user.createdAt).toLocaleDateString()}

Dial *384*321# to continue`;
                }
              }
              break;
            case '5':
              if (userSession.userExists) {
                response = `END SmartTax Trader USSD Help:
1. Pay Tax - Make new tax payment
2. Check Balance - View your totals
3. Recent Tx - Last 3 transactions
4. My Profile - Account information

Support: support@smarttax.com`;
              }
              break;
            default:
              response = `END Invalid option. Please try again.`;
          }
          break;

        case 2:
          if (textArray[0] === '1' && !userSession.userExists) {
            // Registration - username input
            userSession.registrationData = {
              username: userInput,
              phone: phoneNumber
            };
            response = `CON Enter your email:`;
          } else if (textArray[0] === '2' && !userSession.userExists && userSession.loginFlow) {
            // Login - password input
            userSession.loginPhone = phoneNumber;
            userSession.loginPassword = userInput;
            
            // Attempt login
            const user = await User.findOne({ where: { phone: phoneNumber } });
            if (user && await bcrypt.compare(userInput, user.password)) {
              userSession.userExists = true;
              userSession.loggedInUser = user;
              response = `CON Login successful! Welcome ${user.username}
1. Pay Tax
2. Check Balance
3. Recent Transactions
4. My Profile`;
            } else {
              response = `END Invalid password. Please try again.`;
            }
          } else if (textArray[0] === '1' && userSession.userExists) {
            // Pay tax - product name
            userSession.productName = userInput;
            response = `CON Enter Product Price (₵):`;
          }
          break;

        case 3:
          if (textArray[0] === '1' && !userSession.userExists) {
            // Registration - email input
            userSession.registrationData.email = userInput;
            response = `CON Create a password (min 6 characters):`;
          } else if (textArray[0] === '1' && userSession.userExists) {
            // Pay tax - price input
            const productName = textArray[1];
            const price = parseFloat(userInput);
            
            if (isNaN(price) || price <= 0) {
              response = `END Invalid price. Please start again.`;
            } else {
              // Calculate tax
              const taxRate = 15;
              const taxAmount = (price * taxRate) / 100;
              const totalAmount = price;
              const traderReceives = price - taxAmount;
              
              // Generate transaction ID
              const transactionId = `USSD${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
              
              response = `CON Confirm Payment:
Product: ${productName}
Price: ₵${price.toFixed(2)}
Tax (15%): ₵${taxAmount.toFixed(2)}
You Receive: ₵${traderReceives.toFixed(2)}

1. Confirm
2. Cancel`;
              
              // Store in session for confirmation
              userSession.pendingTransaction = {
                productName,
                price,
                taxAmount,
                traderReceives,
                transactionId,
                phoneNumber
              };
            }
          }
          break;

        case 4:
          if (textArray[0] === '1' && !userSession.userExists) {
            // Registration - password input
            const registrationData = userSession.registrationData;
            
            if (userInput.length < 6) {
              response = `END Password too short. Minimum 6 characters required.`;
            } else {
              try {
                // Create new user
                const user = await User.create({
                  username: registrationData.username,
                  email: registrationData.email,
                  password: userInput,
                  phone: registrationData.phone,
                  role: 'user'
                });

                userSession.userExists = true;
                userSession.loggedInUser = user;
                
                response = `END Registration successful! Welcome ${user.username}
                
Your account has been created.
You can now:
- Pay taxes instantly
- Track your payments
- View your history

Dial *384*321# to make your first payment!`;
              } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                  response = `END Username or email already exists. Please try different details.`;
                } else {
                  response = `END Registration failed. Please try again.`;
                }
              }
            }
          } else if (textArray[0] === '1' && userSession.userExists && userInput === '1') {
            // Confirm payment
            const pendingTx = userSession.pendingTransaction;
            
            if (!pendingTx) {
              response = `END Session expired. Please start again.`;
            } else {
              // Find user by phone number
              const user = await User.findOne({ where: { phone: pendingTx.phoneNumber } });
              
              if (!user) {
                response = `END User not found. Please register first.`;
              } else {
                // Create tax record
                const tax = await Tax.create({
                  productName: pendingTx.productName,
                  price: pendingTx.traderReceives,
                  taxPercentage: 15,
                  taxAmount: pendingTx.taxAmount,
                  totalAmount: pendingTx.price,
                  transactionId: pendingTx.transactionId,
                  paymentMethod: 'USSD',
                  status: 'completed',
                  UserId: user.id
                });

                response = `END Payment Successful! ✅

Product: ${tax.productName}
You Received: ₵${tax.price.toFixed(2)}
Tax Paid: ₵${tax.taxAmount.toFixed(2)}
Txn ID: ${tax.transactionId}

Thank you for using SmartTax!
Dial *384*321# for more options.`;
              }
            }
          } else if (textArray[0] === '1' && userSession.userExists && userInput === '2') {
            response = `END Payment cancelled. Thank you.`;
          }
          break;

        default:
          response = `END Session ended. Dial *384*321# to start again.`;
      }
    }

    // Update session
    req.session = userSession;
    
    console.log('USSD Response:', response);
    res.set('Content-Type', 'text/plain');
    res.send(response);

  } catch (error) {
    console.error('USSD Processing Error:', error);
    res.set('Content-Type', 'text/plain');
    res.send(`END Sorry, an error occurred. Please try again later. Error: ${error.message}`);
  }
};

// Enhanced session middleware
exports.ussdSession = (req, res, next) => {
  const { sessionId, phoneNumber } = req.body;
  
  // Initialize session storage if not exists
  if (!global.ussdSessions) {
    global.ussdSessions = new Map();
  }
  
  const sessionKey = sessionId || phoneNumber;
  
  if (sessionKey && global.ussdSessions.has(sessionKey)) {
    req.session = global.ussdSessions.get(sessionKey);
  } else {
    req.session = {
      userExists: false,
      loginFlow: false,
      registrationData: {},
      pendingTransaction: null,
      loggedInUser: null
    };
  }
  
  // Check if user exists for this phone number
  if (phoneNumber && !req.session.userExists) {
    User.findOne({ where: { phone: phoneNumber } })
      .then(user => {
        if (user) {
          req.session.userExists = true;
          req.session.loggedInUser = user;
        }
        next();
      })
      .catch(error => {
        console.error('Error checking user:', error);
        next();
      });
  } else {
    next();
  }
  
  // Store session after processing
  const originalSend = res.send;
  res.send = function(data) {
    if (sessionKey) {
      global.ussdSessions.set(sessionKey, req.session);
      // Clear session after 10 minutes
      setTimeout(() => {
        global.ussdSessions.delete(sessionKey);
      }, 10 * 60 * 1000);
    }
    originalSend.call(this, data);
  };
};