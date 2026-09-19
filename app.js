require('module-alias/register')
require('dotenv').config();
const express = require('express');
const app = express();
const connect = require('./db/connect');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { authenticator, notFound, errorHandler } = require('./middleware');
const { authRouter, tasksRouter, tagsRouter, accountRouter } = require('./routes');
const { minute } = require('./utils/time');

// middleware
app.use(fileUpload({
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    abortOnLimit: true
}));
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true
}))


app.use(helmet())
app.use(express.json());
app.use(cookieParser(process.env.COOKIES_SECRET));
app.use(express.urlencoded())
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', authenticator, tasksRouter);
app.use('/api/v1/tags', authenticator, tagsRouter);
app.use('/api/v1/account', authenticator, accountRouter);
app.use(notFound);
app.use(errorHandler);
const port = process.env.PORT || 5000;
const start = async () => {
    try {
        await connect(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server listening on port ${port}`));
    } catch (error) {
        console.log(error.message);
    }
}
start();