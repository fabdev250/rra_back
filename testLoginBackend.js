require('dotenv').config();
const { Admin } = require('./models');
const bcrypt = require('bcryptjs');

async function testBackendLogin(email, password) {
  try {
    console.log(`\n🔐 Testing backend login for: ${email}`);
    
    // Find admin
    const admin = await Admin.findOne({ 
      where: { email, is_active: true } 
    });
    
    if (!admin) {
      console.log('❌ Admin not found or inactive');
      return false;
    }
    
    console.log(`✅ Admin found: ${admin.name} (${admin.role})`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Stored password hash: ${admin.password_hash.substring(0, 20)}...`);
    
    // Test password directly
    const isValid = await bcrypt.compare(password, admin.password_hash);
    console.log(`🔍 Password "${password}" validation: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    // Test common issues
    console.log(`\n🔧 Debug info:`);
    console.log(`   - Password length: ${password.length}`);
    console.log(`   - Hash starts with: ${admin.password_hash.substring(0, 7)}`);
    console.log(`   - Is bcrypt hash: ${admin.password_hash.startsWith('$2a$') || admin.password_hash.startsWith('$2b$')}`);
    
    return isValid;
  } catch (error) {
    console.error('❌ Error testing login:', error);
    return false;
  }
}

async function runAllTests() {
  const testCases = [
    { email: 'rraadmin@rra.gov.rw', password: 'rra123' },
    { email: 'localadmin@kigali.gov.rw', password: 'local123' },
    { email: 'agent@nyamirambo.gov.rw', password: 'agent123' }
  ];

  let allPassed = true;
  
  for (const test of testCases) {
    const passed = await testBackendLogin(test.email, test.password);
    if (!passed) allPassed = false;
  }
  
  console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'}`);
  process.exit(allPassed ? 0 : 1);
}

runAllTests();