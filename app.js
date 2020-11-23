require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const {verify} = require('./middleware')
const app = express()

const {home, secure, login, refresh} = require('./authentication')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())  

app.post('/login', login);
app.post('/refrsh', refresh);
app.get('/secure', verify, secure);
app.get('/', home);

const port = 3001;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
  