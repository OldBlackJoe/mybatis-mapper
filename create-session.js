// var mysql = require('mysql2');
var MyBatis = require('./index');
var { plainToInstance } = require('class-transformer');

class MyBatisSession {
    #connection;
    #namespace;

    constructor(connection, namespace, mappers) {
        this.#connection = connection;
        this.#namespace = namespace;
        MyBatis.createMapper(mappers);
    }

    async select(mapperId, params) {
        const query = MyBatis.getStatement(this.#namespace, mapperId, params, {
            language: 'sql',
            indent: '  ',
        });

        const [rows] = await this.#connection.promise().query(query);

        return rows;
    }

    async selectFirst(mapperId, params, model) {
        const rows = await this.select(mapperId, params, model);
        return rows[0];
    }

    async selectList(mapperId, params, model) {
        const rows = await this.select(mapperId, params);
        return rows.map((row) => plainToInstance(model, row));
    }

    async selectAndCatchSilently(mapperId, params, model) {
        try {
            return await this.selectList(mapperId, params, model);
        } catch (error) {
            console.error('[ERROR]:\`queryCatchAndMapTo\`', error);
            return [];
        }
    }
}

module.exports = MyBatisSession;
