declare namespace MybatisMapper {
  export type MyBatisMapper = {
    [name: string]: MyBatisMapper | Array<number | string | null | boolean>;
  };

  export type Params = {
    [name: string]:
      | string
      | string[]
      | number
      | number[]
      | boolean
      | null
      | undefined;
  };

  export type Format = {
    language?: "sql" | "db2" | "n1ql" | "pl/sql";
    indent?: string;
    params?: Params;
  };

  export function createMapper(xmls: string[]): void;

  export function getStatement(
    namespace: string,
    sql: string,
    param?: Params,
    format?: Format
  ): string;

  export function getMapper(): MyBatisMapper;
}

export = MybatisMapper;
