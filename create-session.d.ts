import {Connection} from 'mysql2';
import {ClassConstructor} from 'class-transformer';
import {Params} from "./index";

declare class MyBatisSession {
    /**
     * @param {Connection} connection - MySQL connection object
     * @param {string} namespace - Namespace of the mapper
     * @param {string[]} mappers - File paths to the mappers
     */
    constructor(connection: Connection, namespace: string, mappers: string[]);

    /**
     * Query a MySQL database
     * @param {string} mapperId - Mapper ID
     * @param {Params} params - Query parameters
     * @return {Promise<unknown[]>}
     */
    select: (mapperId: string, params: Params) => Promise<unknown[]>;

    /**
     * Query a MySQL database, and on error return empty array with error logged
     * @template T
     * @param {string} mapperId - Mapper ID
     * @param {Params} params - Query parameters
     * @param {ClassConstructor<T>} model - Model class
     * @return {Promise<T[]>}
     */
    selectAndCatchSilently: <T>(mapperId: string, params: Params, model: ClassConstructor<T>) => Promise<T[]>;

    /**
     * Query a MySQL database and map the result to a single model
     * @template T
     * @param {string} mapperId - Mapper ID
     * @param {Params} params - Query parameters
     * @param {ClassConstructor<T>} model - Model class
     * @return {Promise<T>}
     */
    selectFirst: <T>(mapperId: string, params: Params, model: ClassConstructor<T>) => Promise<T | undefined>;

    /**
     * Query a MySQL database and map the result to a model list
     * @template T
     * @param {string} mapperId - Mapper ID
     * @param {Params} params - Query parameters
     * @param {ClassConstructor<T>} model - Model class
     * @return {Promise<T[]>}
     */
    selectList: <T>(mapperId: string, params: Params, model: ClassConstructor<T>) => Promise<T[]>;

    /**
     * Get the MySQL connection object
     * @return {Connection}
     */
    get connection(): Connection;

    /**
     * End the MySQL connection
     * @return {void}
     */
    end: () => void;
}

export = MyBatisSession;
