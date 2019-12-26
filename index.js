const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session') // middleware
const authRouter = require('./routes/admin/auth');
const productsRouter = require('./routes/admin/products');

const app = express();

app.use(express.static('public')); //checks all request to see if any of the requests made include any files from the public folder
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieSession({
  keys: ['cnzvmsfsjkhsfdd33'] // a random string of chars - will add an additional property to req object (req.session)
}))

app.use(authRouter);
app.use(productsRouter);

app.listen(3001, () => {
    console.log('Listening')
})