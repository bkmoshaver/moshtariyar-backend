/**
 * Fix Slugs Script
 * این اسکریپت برای فروشگاه‌هایی که slug ندارند، یک slug پیش‌فرض می‌سازد
 */

const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
require('dotenv').config();

const fixSlugs = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tenants = await Tenant.find({ $or: [{ slug: { $exists: false } }, { slug: '' }] });
    console.log(`Found ${tenants.length} tenants without slug`);

    for (const tenant of tenants) {
      // ساخت slug از نام فروشگاه
      let slug = tenant.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // جایگزینی کاراکترهای غیرمجاز با خط تیره
        .replace(/^-+|-+$/g, ''); // حذف خط تیره از ابتدا و انتها

      // اگر slug خالی شد (مثلاً نام فارسی بود)، از ID استفاده کن
      if (!slug || slug.length < 3) {
        slug = `store-${tenant._id.toString().slice(-6)}`;
      }

      // بررسی تکراری نبودن
      let uniqueSlug = slug;
      let counter = 1;
      while (await Tenant.findOne({ slug: uniqueSlug, _id: { $ne: tenant._id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      tenant.slug = uniqueSlug;
      await tenant.save();
      console.log(`Updated tenant ${tenant.name} with slug: ${uniqueSlug}`);
    }

    console.log('All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixSlugs();
