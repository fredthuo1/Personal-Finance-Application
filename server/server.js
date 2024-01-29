const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

connectDB();

app.use(express.json());
app.use(cors());  
if (process.env.USE_HTTPS_ENFORCE) {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});