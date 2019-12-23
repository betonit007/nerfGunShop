const { check } = require('express-validator');
const usersRepo = require('../../repos/users');

module.exports = {
    requireEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async (email) => {   //remove whitespace, sanitize with normalizeEmail, validate that is email structure, custom validation to see if email exists
            const existingUser = await usersRepo.getOneBy({ email });
            if (existingUser) {
                throw new Error('Email in use');
            }
        }),
    requirePassword: check('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage("Must be between 4 and 20 charactres"), //has a minimum and maximum length

    requirePasswordConfirmation: check('passwordConfirmation')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Must be between 4 and 20 characters')
        // .custom((passwordConfirmation, request) => {
        //     console.log(request.req.body)

        // })

    //Keep getting 'Invalid Value' error with above custom method?????????????????????
};