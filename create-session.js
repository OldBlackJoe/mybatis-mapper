var MyBatis = require('./index');
var { plainToInstance } = require('class-transformer');

class MyBatisSession {
    #connection;
    #namespace;
    #debugMode;

    constructor(connection, namespace, mappers, debugMode = false) {
        this.#connection = connection;
        this.#namespace = namespace;
        this.#debugMode = debugMode;
        MyBatis.createMapper(mappers);
    }

    async select(mapperId, params) {
        const query = MyBatis.getStatement(this.#namespace, mapperId, params, {
            language: 'sql',
            indent: '  ',
        });

        if (!!this.#debugMode) {
            console.log(`Query for namespace: ${this.#namespace} & mapperID: ${mapperId}`);
            console.log(query);
        }

        const [rows] = await this.#connection.promise().query(query);

        return rows;
    }

    async selectOne(mapperId, params, model) {
        const rows = await this.selectList(mapperId, params, model);
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
            console.error('[ERROR]:\`selectAndCatchSilently\`', error);
            return [];
        }
    }

    get connection() {
        return this.#connection;
    }

    end() {
        this.#connection.end();
    }
}

module.exports = MyBatisSession;
