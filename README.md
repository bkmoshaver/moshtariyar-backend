# مشتریار - Backend

سیستم مدیریت ارتباط با مشتری (CRM) برای کسب‌وکارهای خدماتی

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+
- MongoDB 5+

### نصب
```bash
npm install
```

### تنظیمات
فایل `.env` را ایجاد کنید:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/moshtariyar
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
```

### اجرا
```bash
# Development
node src/server.js

# یا با nodemon
npm install -g nodemon
nodemon src/server.js
```

## ساختار پروژه

```
src/
├── config/
│   └── database.js       # اتصال MongoDB
├── models/
│   ├── Tenant.js         # مدل کسب‌وکار
│   ├── Staff.js          # مدل کارمند
│   ├── Client.js         # مدل مشتری
│   ├── Service.js        # مدل سرویس
│   └── index.js
├── controllers/
│   ├── auth.controller.js
│   ├── client.controller.js
│   └── service.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── client.routes.js
│   ├── service.routes.js
│   └── index.js
├── middleware/
│   ├── auth.js           # احراز هویت JWT
│   ├── validate.js       # اعتبارسنجی Joi
│   └── errorHandler.js   # مدیریت خطا
├── validators/
│   ├── auth.validator.js
│   ├── client.validator.js
│   └── service.validator.js
├── utils/
│   ├── errorResponse.js
│   └── jwt.js
└── server.js             # Entry Point
```

## API Endpoints

### احراز هویت
- `POST /api/auth/register` - ثبت‌نام کسب‌وکار جدید
- `POST /api/auth/login` - ورود
- `GET /api/auth/me` - دریافت اطلاعات کاربر فعلی

### مشتریان
- `GET /api/clients` - لیست مشتریان (با پشتیبانی از جستجو)
- `POST /api/clients` - افزودن مشتری
- `GET /api/clients/:id` - جزئیات مشتری
- `PUT /api/clients/:id` - ویرایش مشتری
- `DELETE /api/clients/:id` - حذف مشتری

### سرویس‌ها
- `GET /api/services` - لیست سرویس‌ها
- `POST /api/services` - ثبت سرویس جدید
- `GET /api/services/client/:clientId` - سرویس‌های یک مشتری

## مدل‌های داده

### Tenant (کسب‌وکار)
```javascript
{
  name: String,           // نام کسب‌وکار
  plan: String,           // free, basic, premium
  features: {
    maxClients: Number,
    maxStaff: Number,
    analytics: Boolean
  },
  createdAt: Date
}
```

### Staff (کارمند)
```javascript
{
  tenantId: ObjectId,
  name: String,
  phone: String,          // شماره موبایل (یونیک)
  email: String,
  password: String,       // هش شده با bcrypt
  role: String,           // owner, manager, staff
  isActive: Boolean,
  createdAt: Date
}
```

### Client (مشتری)
```javascript
{
  tenantId: ObjectId,
  name: String,
  phone: String,
  email: String,
  wallet: Number,         // موجودی کیف پول (تومان)
  totalSpent: Number,     // کل خرید
  totalGifts: Number,     // کل هدایا
  serviceCount: Number,   // تعداد سرویس
  lastVisit: Date,
  notes: String,
  createdAt: Date
}
```

### Service (سرویس)
```javascript
{
  tenantId: ObjectId,
  clientId: ObjectId,
  staffId: ObjectId,
  description: String,
  amount: Number,         // مبلغ پرداختی
  giftAmount: Number,     // مبلغ هدیه (10% از amount)
  date: Date,
  createdAt: Date
}
```

## منطق کسب‌وکار

### سیستم کیف پول
- هر سرویس 10% هدیه به کیف پول مشتری اضافه می‌کند
- مشتری می‌تواند از موجودی کیف پول برای خرید بعدی استفاده کند

### محاسبات خودکار
- `totalSpent` = مجموع تمام سرویس‌ها
- `totalGifts` = مجموع تمام هدایا
- `serviceCount` = تعداد سرویس‌های دریافتی
- `lastVisit` = تاریخ آخرین سرویس

## امنیت

- رمزهای عبور با bcrypt هش می‌شوند
- JWT برای احراز هویت
- Validation کامل با Joi
- CORS فعال برای Frontend
- Error handling حرفه‌ای

## دیپلوی

### Railway
1. فایل‌ها را push کنید
2. MongoDB Atlas را به عنوان دیتابیس اضافه کنید
3. متغیرهای محیطی را تنظیم کنید
4. دیپلوی کنید

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

## توسعه

### اضافه کردن Endpoint جدید
1. Validator در `validators/` بسازید
2. Controller در `controllers/` بسازید
3. Route در `routes/` اضافه کنید
4. در `routes/index.js` ثبت کنید

### اضافه کردن Model جدید
1. Schema در `models/` بسازید
2. در `models/index.js` export کنید
3. Controller و Route مربوطه را اضافه کنید

## لایسنس
MIT
