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


app.post('/createJWT', (req, res) => {

    if (req.body.username != 'mustafa' || req.body.password != 'deneme12') {
        return res.sendStatus(403);
    }
    // this api generates jwt token for user
    res.json(jwt.sign({
            username: req.params.username
        },
        process.env.TOKEN_SECRET, {
            expiresIn: '1800s'
        }));
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})