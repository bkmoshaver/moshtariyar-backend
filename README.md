# مشتریار Backend - نسخه تمیز

## 📦 محتویات

```
backend/
├── src/                    # کد منبع
│   ├── config/            # تنظیمات (Redis اختیاری)
│   ├── controllers/       # کنترلرها
│   ├── models/            # مدل‌های دیتابیس
│   ├── routes/            # مسیرها
│   ├── services/          # سرویس‌ها (SMS)
│   ├── workers/           # Worker ها
│   ├── middleware/        # Middleware ها
│   ├── validators/        # اعتبارسنجی
│   ├── utils/             # ابزارها
│   └── server.js          # نقطه ورود
├── package.json           # Dependencies
├── Procfile               # Railway config
├── .gitignore             # Git ignore
└── README.md              # این فایل
```

## 🚀 Deploy به Railway

### 1. پاک کردن پوشه قبلی
```bash
cd C:\Users\11\Desktop\moshtariyar-complete-package
rmdir /s /q backend
```

### 2. Extract این ZIP
```
moshtariyar-backend-clean.zip → C:\Users\11\Desktop\moshtariyar-complete-package\backend
```

### 3. Git Push
```bash
cd C:\Users\11\Desktop\moshtariyar-complete-package\backend
git add .
git commit -m "Clean backend - Redis optional"
git push origin main
```

## ⚙️ Environment Variables در Railway

```env
MONGODB_URI=mongodb+srv://bkmoshaver_db_user:...
JWT_SECRET=moshtariyar-secret-key-2024
JWT_REFRESH_SECRET=moshtariyar-refresh-secret-2024
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SMS_API_KEY=username:password
SMS_SENDER=9982002562
BUSINESS_NAME=کافی‌نت کلاسیک
NODE_ENV=production
PORT=3000
```

**توجه:** `REDIS_URL` را اضافه **نکنید**

## ✅ ویژگی‌ها

- ✅ بدون Redis کار می‌کند
- ✅ پیامک فوری بعد از خدمت
- ✅ کسر خودکار کیف پول
- ✅ محاسبه هدیه 10%
- ⚠️  پیامک نظرسنجی غیرفعال (نیاز به Redis)

## 🎉 آماده استفاده!
