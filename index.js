const jwt = require('jsonwebtoken'); // for jwt authentication 
const express = require('express')
const dotenv = require('dotenv'); // for using .env variables
const app = express()
const port = 3000


//for reading .env file content
dotenv.config();

// for parsing json payload 
app.use(express.json());

app.use(function (req, res, next) {
    // my custom middleware  
    console.log('Time:', Date.now())
    next();
})



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


app.get('/genericEndpoint', authenticateToken, (req, res) => {
    res.send('Hello World!')
    // use code below to create you apps `token secret`
    //console.log(require('crypto').randomBytes(64).toString('hex'));
    // get config vars
    // access config var
    console.log(req.headers['authorization'])
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
        title: 'The Mythbuster’s Guide to Saving Money on Energy Bills',
        body: 'If you have been here a long time, you might remember when I went on ITV Tonight to' +
            'dispense a masterclass in saving money on energy bills.Energy - saving is one of my favourite money' +
            'topics, because once you get past the boring bullet - point lists,' +
            'a whole new world of thrifty nerdery' +
            'opens up.You know those bullet - point lists.You start spotting them everything at this time of year.' +
            'They go like this: '
    }, (error, blogpost) => {
        console.log(error, blogpost)
    })

    res.send('created');
});