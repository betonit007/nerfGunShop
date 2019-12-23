const express = require('express');
const { check, validationResult } = require('express-validator');
const usersRepo = require('../../repos/users');
const signupTemplate = require('../../view/admin/auth/signup');
const signInTemplate = require('../../view/admin/auth/signin');
const { requireEmail, requirePassword, requirePasswordConfirmation } = require('./validators');
const router = express.Router();


router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
})

router.post('/signup',
    [requireEmail, requirePassword, requirePasswordConfirmation], async (req, res) => {

        const errors = validationResult(req); // results of above checks are passed into req object.

        const { email, password, passwordConfirmation } = req.body;

        //hack for check.custom method error
        if (!errors.isEmpty()) {
            return res.send(signupTemplate({ req, errors }));
        }
        if (password !== passwordConfirmation) {
            return res.send(signupTemplate({ req, errors: "!confirmation" }))
        }

        const user = await usersRepo.create({ email, password });

        req.session.userId = user.id; // req.session added by cookie session

        res.send('Account Created');
    })


router.get('/signout', (req, res) => {
    req.session = null; // wipes out cookie;
    res.send('You are logged out');
});


router.get('/signin', (req, res) => {
    res.send(signInTemplate());
})


router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    const user = await usersRepo.getOneBy({ email });

    if (!user) {
        return res.send('Email not found');
    }

    const validPassword = await usersRepo.comparePasswords(
        user.password,
        password
    )


    if (!validPassword) {
        return res.send('Invalid password');
    }

    req.session.userId = user.id // Assigning user id to cookie

    res.send('You are signed in');
})

module.exports = router;