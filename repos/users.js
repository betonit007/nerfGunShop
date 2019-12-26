const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt) // now scrypt is a version of scrypt that returns a promise

class UsersRepo extends Repository {
    async create(attrs) {
        attrs.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex');// generate salt, 8 - number of bytes

        const buf = await scrypt(attrs.password, salt, 64); //passing in password and salt we just generated, and key length of 64

        const records = await this.getAll();
        const record = ({
            ...attrs,
            password: `${buf.toString('hex')}.${salt}` //we're saving the 'hashed password' and salt, seperated by '.',  so we can decode later
        });
        records.push(record);

        await this.writeAll(records);

        return record; // returns hash and salted password.
    }

    async comparePasswords(saved, supplied) {
        
        const [ hashed, salt ] = saved.split('.'); //This is same as this:   const result = saved.split('.');
                                                                        //   const hashed = result[0];
                                                                        //   const salt = result[1];

        const hashedSupplied = await scrypt(supplied, salt, 64);
        
        return hashed === hashedSupplied.toString('hex');
    }

}

module.exports = new UsersRepo('users.json'); // this exports just an instance of UsersRepo instead of entire constructor.

//module.exports = UsersRepository; // this would export entire constructor - not the best approach