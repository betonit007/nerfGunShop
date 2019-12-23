const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt) // now scrypt is a version of scrypt that returns a promise

class UsersRepo {
    constructor(filename) {
        if (!filename) {
            throw new Error('Creating a repo requires a file name');
        }
        this.filename = filename;
        try {
            fs.accessSync(this.filename);
        } catch (err) {
            fs.writeFileSync(this.filename, '[]');
        }
    }
    async getAll() {
        return JSON.parse(await fs.promises.readFile(this.filename, {
            encoding: 'utf8'
        }))
    }

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

    async writeAll(records) {
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2)) // the last two arguments format the output (null takes in a custom formatter, second is indentation)
    }

    randomId() {
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id) {
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }

    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);
        await this.writeAll(filteredRecords);
    }

    async update(id, attrs) {
        const records = await this.getAll();
        const record = records.find(record => record.id === id);

        if (!record) {
            throw new Error(`Record with id ${id} not found`)
        }
        Object.assign(record, attrs); // Object.assign takes both objects and combines them into one (record and attrs are combine under record variable)
        await this.writeAll(records);
    }

    async getOneBy(filter) {
        const records = await this.getAll();

        for (let record of records) { //iterating thru an array - for of
            let found = true;

            for (let key in filter) { // iterating thru an object = for in
                if (record[key] !== filter[key]) {
                    found = false;
                }
            }

            if (found) {
                return record;
            }
        }
    }

}

module.exports = new UsersRepo('users.json'); // this exports just an instance of UsersRepo instead of entire constructor.

//module.exports = UsersRepository; // this would export entire constructor - not the best approach