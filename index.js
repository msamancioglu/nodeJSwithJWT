const jwt = require('jsonwebtoken'); // for jwt authentication 
const express = require('express')
const dotenv = require('dotenv'); // for using .env variables
const app = express()
const expressSession = require('express-session');
const port = 3000
const blogsRouter = require('./routers/blogs')
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

//for reading .env file content
dotenv.config();

// for parsing json payload 
app.use(express.json());

// Use express.Router() mini-app

app.use('/blogs', blogsRouter)

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerJsdoc({
        definition: {
            openapi: "3.0.0",
            info: {
                title: "ExpressJS API documentation with Swagger",
                version: "0.1.0",
                description: "This is a simple CRUD API application made with Express and documented with Swagger",
                license: {
                    name: "MIT",
                    url: "https://spdx.org/licenses/MIT.html",
                },
                contact: {
                    name: "LogRocket",
                    url: "https://logrocket.com",
                    email: "info@email.com",
                },
            },
            servers: [{
                url: "http://localhost:3000/blogs",
            }, ],
        },
        apis: ["./blogsRouter.js"],
    }))
);


app.use(function (req, res, next) {
    // my custom middleware  
    console.log('Time:', Date.now())
    next();
});

// activate session middleware
app.use(expressSession({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'some secret key to encrypt session id with'
}));

// example session variable usage
app.get('/incrementsessionval', (req, res) => {
    if (req.session.views) {
        ++req.session.views;
    } else {
        req.session.views = 1;
    }

    res.send(` session val = ${req.session.views}`);
});

app.get('/getsessionval', (req, res) => {
    res.send(` session val = ${req.session.views}`);
});

app.post('/register', (req, res) => {
    console.log(req.body)
    const mongoose = require('mongoose')
    const User = require('./models/User.js')
    mongoose.connect('mongodb://localhost/myblog', {
        useNewUrlParser: true
    });
    User.create(req.body, (error, user) => {
        res.send('created')
    })
});



app.get('/list', (req, res) => {
    console.log(req.body)
    const mongoose = require('mongoose')
    const User = require('./models/User.js')
    mongoose.connect('mongodb://localhost/myblog', {
        useNewUrlParser: true
    });


    User.find({}, (error, user) => {
        console.log(user);
        res.send(user)
    })
});

app.post('/login', (req, res) => {
    const {
        username,
        password
    } = req.body;
    const bcrypt = require('bcrypt')
    const mongoose = require('mongoose')
    const User = require('./models/User.js')
    mongoose.connect('mongodb://localhost/myblog', {
        useNewUrlParser: true
    });
    User.findOne({
        username: username
    }, (error, user) => {
        if (error) {
            console.log('error ' + error);
            res.send(error);
        }
        if (user) {
            bcrypt.compare(password, user.password, (error, same) => {
                if (same) {
                    //res.send(` Wellcome user  ${user.username}`);
                    console.log(user);
                    res.json(jwt.sign({
                            username: req.params.username
                        },
                        process.env.TOKEN_SECRET, {
                            expiresIn: '1800s'
                        }));
                } else {
                    console.log(' sorry wrogn password for USER: ' + user);
                    res.send(' sorry wrogn password for USER: ' + user.username);
                }
            })
        }
    });
});


// ekleme

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log(token)
    console.log(process.env.TOKEN_SECRET);
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        req.user = user;
        console.log(req.user)
    })
    next();
}


//
app.get('/user/:user/post/:postid', (req, res) => {
    console.log(req.params);
    console.log(req.params.user);
    console.log(req.params.postid);
});

app.get('/genericEndpoint', authenticateToken, (req, res) => {
    res.send('Hello World!')
    // use code below to create you apps `token secret`
    //console.log(require('crypto').randomBytes(64).toString('hex'));
    // get config vars
    // access config var
    console.log(req.headers['authorization'])
})

// route chaining
// hanlde all CRUD operations in a sigle route
app.route('/chain')
    .get(function (req, res) {
        res.send('Retrieve/List')
    })
    .post(function (req, res) {
        res.send('Create')
    })
    .put(function (req, res) {
        res.send('Update')
    })
    .delete(function (req, res) {
        res.send('Delete')
    })

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.post('/save', (req, res) => {
    console.log('hello save');
    const mongoose = require('mongoose')
    const BlogPost = require('./models/BlogPost')
    mongoose.connect('mongodb://localhost/myblog', {
        useNewUrlParser: true
    });
    BlogPost.create({
        title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
        body: ' A purely peer-to-peer version of electronic cash would allow online payments' +
            ' to be sent directly from one party to another without going through a' +
            ' financial institution. Digital signatures provide part of the solution, but the main' +
            ' benefits are lost if a trusted third party is still required to prevent double-spending.' +
            ' We propose a solution to the double-spending problem using a peer-to-peer network.'
    }, (error, blogpost) => {
        console.log(error, blogpost)
    })

    res.send('created');
});