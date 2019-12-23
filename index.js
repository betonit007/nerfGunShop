const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session') // middleware
const authRouter = require('./routes/admin/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieSession({
  keys: ['cnzvmsfsjkhsfdd33'] // a random string of chars - will add an additional property to req object (req.session)
}))

app.use(authRouter);

app.listen(3001, () => {
    console.log('Listening')
})