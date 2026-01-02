const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Client = require('../models/Client');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moshtariyar');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

const seedTestUsers = async () => {
  await connectDB();

  try {
    // 1. Clear existing test data (optional, but safer for clean slate)
    // await User.deleteMany({ email: { $in: ['super@test.com', 'admin@test.com', 'staff@test.com', 'client@test.com'] } });
    // await Tenant.deleteMany({ slug: 'test-shop' });
    
    // Check if tenant exists, create if not
    let tenant = await Tenant.findOne({ slug: 'test-shop' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'فروشگاه تست',
        slug: 'test-shop',
        owner: new mongoose.Types.ObjectId(), // Placeholder, will update
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        }
      });
      console.log('Created Tenant:', tenant.name);
    }

    const password = 'password123'; // Common password for all test users

    // 2. Create Super Admin
    let superAdmin = await User.findOne({ email: 'super@test.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'مدیر کل سیستم',
        email: 'super@test.com',
        password: password,
        role: 'super_admin',
        username: 'super_admin'
      });
      console.log('Created Super Admin: super@test.com');
    } else {
      // Ensure role is correct
      superAdmin.role = 'super_admin';
      await superAdmin.save();
      console.log('Updated Super Admin: super@test.com');
    }

    // 3. Create Tenant Admin (Store Owner)
    let tenantAdmin = await User.findOne({ email: 'admin@test.com' });
    if (!tenantAdmin) {
      tenantAdmin = await User.create({
        name: 'مدیر فروشگاه',
        email: 'admin@test.com',
        password: password,
        role: 'tenant_admin',
        tenant: tenant._id,
        username: 'shop_admin'
      });
      console.log('Created Tenant Admin: admin@test.com');
    } else {
      tenantAdmin.role = 'tenant_admin';
      tenantAdmin.tenant = tenant._id;
      await tenantAdmin.save();
      console.log('Updated Tenant Admin: admin@test.com');
    }

    // Update tenant owner
    tenant.owner = tenantAdmin._id;
    await tenant.save();

    // 4. Create Staff
    let staff = await User.findOne({ email: 'staff@test.com' });
    if (!staff) {
      staff = await User.create({
        name: 'کارمند فروشگاه',
        email: 'staff@test.com',
        password: password,
        role: 'staff',
        tenant: tenant._id,
        username: 'shop_staff'
      });
      console.log('Created Staff: staff@test.com');
    } else {
      staff.role = 'staff';
      staff.tenant = tenant._id;
      await staff.save();
      console.log('Updated Staff: staff@test.com');
    }

    // 5. Create Client (User role)
    // Note: In our system, 'client' role in User model represents a customer who can login
    // We also have a Client model for CRM data. Ideally they should be linked.
    let clientUser = await User.findOne({ email: 'client@test.com' });
    if (!clientUser) {
      clientUser = await User.create({
        name: 'مشتری وفادار',
        email: 'client@test.com',
        password: password,
        role: 'client',
        tenant: tenant._id, // Clients can be associated with a tenant or global
        username: 'loyal_client'
      });
      console.log('Created Client User: client@test.com');
    } else {
      clientUser.role = 'client';
      clientUser.tenant = tenant._id;
      await clientUser.save();
      console.log('Updated Client User: client@test.com');
    }

    // Create CRM Client record if not exists (for dashboard stats)
    const crmClient = await Client.findOne({ phone: '09123456789', tenant: tenant._id });
    if (!crmClient) {
      await Client.create({
        name: 'مشتری وفادار',
        phone: '09123456789',
        tenant: tenant._id,
        wallet: { balance: 500000, totalSpent: 2000000 },
        stats: { totalVisits: 5, totalServices: 5 }
      });
      console.log('Created CRM Client Record');
    }

    console.log('\n✅ All test users created successfully!');
    console.log('-----------------------------------');
    console.log('Super Admin:  super@test.com  / password123');
    console.log('Tenant Admin: admin@test.com  / password123');
    console.log('Staff:        staff@test.com  / password123');
    console.log('Client:       client@test.com / password123');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedTestUsers();
