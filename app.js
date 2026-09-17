require('module-alias/register')
require('dotenv').config();
const express = require('express');
const app = express();
const connect = require('./db/connect');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authenticator, notFound, errorHandler } = require('./middleware');
const { authRouter, tasksRouter, tagsRouter, accountRouter } = require('./routes');
const { Message } = require('./models');
const messageModel = require('./models/Message');

// middleware
app.use(fileUpload({
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
}));
app.use(cors())
app.use(express.json());
app.use(cookieParser(process.env.COOKIES_SECRET));
app.use(express.urlencoded())
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/account', authenticator, accountRouter);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
const start = async () => {
    try {
        await connect(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server listening on port ${port}`));
    } catch (error) {
        console.log(error.message);
    }
}
start();