const jwt = require('jsonwebtoken')

// Never do this!
let users = {
    john: {password: "passwordjohn"},
    mary: {password:"passwordmary"},
    egoing: {password:"111111"}
}

exports.home = function(req, res){
    console.log('home');
    res.send(
        `
 <html>
 <body>
        <form action="/login" method="post">
            <p><input type="text" name="username" value="egoing"></p>
            <p><input type="password" name="password" value="111111"></p>
            <p><input type="submit"></p>
        </form>
        <a href="/secure">secure page</a>
 </body>
 </html>
        `
    )
}

exports.login = function(req, res){
    let username = req.body.username
    let password = req.body.password
    
    // Neither do this!
    if (!username || !password || users[username].password !== password){
        return res.status(401).send()
    }
    //use the payload to store information about the user such as username, user role, etc.
    let payload = {username: username}

    //create the access token with the shorter lifespan
    console.log('process.env.ACCESS_TOKEN_LIFE', process.env.ACCESS_TOKEN_LIFE)
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: Number(process.env.ACCESS_TOKEN_LIFE)
    })

    //create the refresh token with the longer lifespan
    let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: Number(process.env.REFRESH_TOKEN_LIFE)
    })

    //store the refresh token in the user array
    users[username].refreshToken = refreshToken

    //send the access token to the client inside a cookie
    res.cookie("jwt", accessToken, {httpOnly: true})
    res.redirect('/')
}

exports.refresh = function (req, res){

    let accessToken = req.cookies.jwt

    if (!accessToken){
        return res.status(403).send()
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
     }
    catch(e){
        return res.status(401).send()
    }

    //retrieve the refresh token from the users array
    let refreshToken = users[payload.username].refreshToken

    //verify the refresh token
    try{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    }
    catch(e){
        return res.status(401).send()
    }

    let newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, 
    {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })

    res.cookie("jwt", newToken, {secure: true, httpOnly: true})
    res.send()
}

exports.secure = function(req, res){

    res.send('secure information');
}
