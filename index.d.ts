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
      | object[]
      | unknown[]
      | boolean
      | null
      | undefined;
  };

  export type FormatLanguage =
    | "bigquery"
    | "db2"
    | "hive"
    | "mariadb"
    | "mysql"
    | "n1ql"
    | "plsql"
    | "postgresql"
    | "redshift"
    | "singlestoredb"
    | "snowflake"
    | "spark"
    | "sql"
    | "sqlite"
    | "transactsql"
    | "trino"
    | "tsql";

  export type KeywordCase = "preserve" | "upper" | "lower";
  export type IndentStyle = "standard" | "tabularLeft" | "tabularRight";
  export type CommaPosition = "before" | "after" | "tabular";
  export type LogicalOperatorNewline = "before" | "after";

  export type Format = {
    language?: FormatLanguage;
    indent?: string;
    params?: Params;
    keywordCase?: KeywordCase;
    tabWidth?: number;
    useTabs?: boolean;
    indentStyle?: IndentStyle;
    logicalOperatorNewline?: LogicalOperatorNewline;
    tabulateAlias?: boolean;
    commaPosition?: CommaPosition;
    expressionWidth?: number;
    linesBetweenQueries?: number;
    denseOperators?: boolean;
    newlineBeforeSemicolon?: boolean;
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
