---
title: 'Cookies in development using localhost'
date: 2020-11-26T06:15:55+06:00
menu:
  sidebar:
    name: Cookies in development
    identifier: development-cookies
    parent: client-server
    weight: 10
---

In this guide we will see how to config server backend with nodejs and exrepress to test cookies in localhost

---

## Keep In Mind

- cookies are created server-side
- the client doesn't handle cookies
- cookies are saved on the browser
- server can read the cookies from the client request

## Setup backend

_index.js_

```
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');

const Auth = require('./Auth');

const privateKey = fs.readFileSync('./certificates/key.pem', 'utf8');
const certificate = fs.readFileSync('./certificates/cert.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
};


const app = express();

app.use(
  cors({
    origin: FRONT_HOST,
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

app.post('/api/login', Auth.loginUser, Auth.silentLogin);
app.get('/api/silent_login', Auth.checkCookie, Auth.silentLogin);

const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(3000, () => {
    console.log('online');
  });
```

Note that origin is not `*` (the wildcard), but one specify URL

_auth.js_

```
const jwt = require('jsonwebtoken');

const secretCode = 'my-secret-code';
const cookieName = 'authData';

exports.checkCookie = async function (req, res, next) {
  try {
    if (!req.cookies[cookieName].token) {
      return res.status(401).send('cookie without token');
    }
    const decoded = await readToken(req.cookies[cookieName].token);
    /*
    [...]
    retrieve user data using id saved in the token and save it on req object
    */
    next();
  } catch (error) {
    return res.status(401).send();
  }
};

exports.silentLogin = async function (req, res) {
  try {
    return res.status(200).send({
      status: 1,  // logged in status
      user: req.user
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

//creates cookie without expiration time
exports.loginUser = async function (req, res, next) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'enter email and password' });
  }
  try {
    /*
    [...]
    check if email and password match in the users table
    retrieve id
    else return res.status(200).send({
      status: -1 // logged out
    });
    */
    //autenticathed

    createCookie(res, {
      userId: userData.id
    });

    req.user = userData;
    next();
  } catch (error) {
    return res.status(400).send(error);
  }
};

const createCookie = function (res, tokenData, { expireDate = null } = {}) {
  res.cookie(
    cookieName,
    {
      token: generateToken(tokenData),
      expires: expireDate ?? 0,
    },
    { httpOnly: true, secure: true }
  );
};

const generateToken = function (tokenData) {
  const token = jwt.sign(tokenData, secretCode, {});
  return token;
};

const readToken = async function (value) {
  return jwt.verify(value, secretCode);
};

```

## Setup cumputer

1. Change the URL of localhost (127.0.0.1) to another name, and replace it in the code in place of FRONT_HOST.

That setup depends on which OS you have.

2. Specify FRONT_HOST as url where to run the client.

## Setup client

the client's request header must have:

- withCredentials: true
- 'Content-Type': 'application/json'
- 'Access-Control-Allow-Origin': location.origin

## Check

In order to check if cookies are saved correctly, we can firstly verify the network request where we call the login api, in the Header section we can see if header is correctly created.

{{<img src="/images/cookie_1.png" align="center">}}

If it is, we can find the cookie in the Application tab under Storage/Cookies/FRONT_HOST
