const fs = require('fs');
const crypto = require('crypto');

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

      const records = await this.getAll();
      records.push(attrs);

      await fs.promises.writeFile(this.filename, JSON.stringify(records));
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

        for(let record of records) { //iterating thru an array - for of
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