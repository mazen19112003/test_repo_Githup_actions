  const jwt = require('jsonwebtoken');

  const authtokenMiddleware = (req, res, next) => {
    // استرجاع التوكن من ترويسة Authorization
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // استخراج التوكن بعد كلمة Bearer

    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    // التحقق من صحة التوكن
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      // إذا التوكن صحيح، قم بتخزين بيانات المستخدم في الطلب
      req.user = decoded;
      next(); // السماح بالوصول إلى الـ route
    });
  };

  module.exports = authtokenMiddleware;
