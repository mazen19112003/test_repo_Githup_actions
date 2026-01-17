const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const domainRoutes = require('./routes/domainRoutes');
const accountRoutes = require('./routes/accountsroute');
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes')
const customerRoutes = require('./routes/Customerroute');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/domains', domainRoutes);
app.use('/api', accountRoutes);
app.use('/api', auth);
app.use('/api', users);
app.use('/api/customers', customerRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('Mongo Error:', err));
