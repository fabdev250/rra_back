require('dotenv').config();

// Correct database connection - use the same as your server
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const createSampleUsers = async () => {
  try {
    // Import models correctly
    const { Admin } = require('../models');
    
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Create sample users with plain passwords
    // The Admin model beforeCreate hook will hash them automatically
    console.log('👥 Preparing sample users...');
    
    const sampleUsers = [
      {
        name: 'RRA National Admin',
        email: 'rraadmin@rra.gov.rw',
        password_hash: 'rra123', // Plain password - will be hashed by model hook
        role: 'rra_admin',
        is_active: true
      },
      {
        name: 'Kigali City Admin',
        email: 'localadmin@kigali.gov.rw',
        password_hash: 'local123', // Plain password - will be hashed by model hook
        role: 'local_admin',
        district_id: 1,
        is_active: true
      },
      {
        name: 'Nyamirambo Sector Agent',
        email: 'agent@nyamirambo.gov.rw',
        password_hash: 'agent123', // Plain password - will be hashed by model hook
        role: 'agent',
        sector_id: 1,
        is_active: true
      }
    ];

    console.log('👥 Creating sample users...');
    
    for (const userData of sampleUsers) {
      const [admin, created] = await Admin.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
      
      if (created) {
        console.log(`✅ Created ${userData.role}: ${userData.email}`);
      } else {
        // Update existing user with correct password hash
        await admin.update({ 
          password_hash: userData.password_hash, 
          is_active: true,
          name: userData.name,
          role: userData.role
        });
        console.log(`🔄 Updated ${userData.role}: ${userData.email}`);
      }
    }

    console.log('\n🎉 Sample users created/updated successfully!');
    console.log('\n🔐 Test Credentials:');
    console.log('   RRA Admin: rraadmin@rra.gov.rw / rra123');
    console.log('   Local Admin: localadmin@kigali.gov.rw / local123');
    console.log('   Agent: agent@nyamirambo.gov.rw / agent123');
    console.log('\n🚀 You can now test the login!');
    
  } catch (error) {
    console.error('❌ Error creating sample users:', error.message);
    console.error('Full error:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Run the function
createSampleUsers();