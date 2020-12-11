const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(statusCode).json({ message: message, data: data });
})

const port = process.env.PORT || 8080;

mongoose.connect("mongodb+srv://tranbakhanhtrinh:airblade08@nodejs-complete-guide.fqrra.mongodb.net/nodejs-api?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log("Client connected!")
        })
    }).catch(err => console.log(err));
