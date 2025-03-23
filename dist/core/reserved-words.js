"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionAttributeHandler = exports.ReservedWords = exports.DYNAMODB_RESERVED_WORDS = void 0;
/**
 * List of DynamoDB reserved words that need to be escaped
 * Source: AWS DynamoDB Documentation
 */
exports.DYNAMODB_RESERVED_WORDS = new Set([
    'ABORT', 'ABSOLUTE', 'ACTION', 'ADD', 'AFTER', 'AGENT', 'AGGREGATE', 'ALL', 'ALLOCATE', 'ALTER',
    'ANALYZE', 'AND', 'ANY', 'ARCHIVE', 'ARE', 'ARRAY', 'AS', 'ASC', 'ASCII', 'ASENSITIVE',
    'ASSERTION', 'ASYMMETRIC', 'AT', 'ATOMIC', 'ATTACH', 'ATTRIBUTE', 'AUTH', 'AUTHORIZATION',
    'AUTHORIZE', 'AUTO', 'AVG', 'BACK', 'BACKUP', 'BASE', 'BATCH', 'BEFORE', 'BEGIN', 'BETWEEN',
    'BIGINT', 'BINARY', 'BIT', 'BLOB', 'BLOCK', 'BOOLEAN', 'BOTH', 'BREADTH', 'BUCKET', 'BULK',
    'BY', 'BYTE', 'CALL', 'CALLED', 'CALLING', 'CAPACITY', 'CASCADE', 'CASCADED', 'CASE', 'CAST',
    'CATALOG', 'CHAR', 'CHARACTER', 'CHECK', 'CLASS', 'CLOB', 'CLOSE', 'CLUSTER', 'CLUSTERED',
    'CLUSTERING', 'CLUSTERS', 'COALESCE', 'COLLATE', 'COLLATION', 'COLLECTION', 'COLUMN',
    'COLUMNS', 'COMBINE', 'COMMENT', 'COMMIT', 'COMPACT', 'COMPILE', 'COMPRESS', 'CONDITION',
    'CONFLICT', 'CONNECT', 'CONNECTION', 'CONSISTENCY', 'CONSISTENT', 'CONSTRAINT', 'CONSTRAINTS',
    'CONSTRUCTOR', 'CONSUMED', 'CONTINUE', 'CONVERT', 'COPY', 'CORRESPONDING', 'COUNT', 'COUNTER',
    'CREATE', 'CROSS', 'CUBE', 'CURRENT', 'CURSOR', 'CYCLE', 'DATA', 'DATABASE', 'DATE', 'DATETIME',
    'DAY', 'DEALLOCATE', 'DEC', 'DECIMAL', 'DECLARE', 'DEFAULT', 'DEFERRABLE', 'DEFERRED',
    'DEFINE', 'DEFINED', 'DEFINITION', 'DELETE', 'DELIMITED', 'DEPTH', 'DEREF', 'DESC', 'DESCRIBE',
    'DESCRIPTOR', 'DETACH', 'DETERMINISTIC', 'DIAGNOSTICS', 'DIRECTORIES', 'DISABLE', 'DISCONNECT',
    'DISTINCT', 'DISTRIBUTE', 'DO', 'DOMAIN', 'DOUBLE', 'DROP', 'DUMP', 'DURATION', 'DYNAMIC',
    'EACH', 'ELEMENT', 'ELSE', 'ELSEIF', 'EMPTY', 'ENABLE', 'END', 'EQUAL', 'EQUALS', 'ERROR',
    'ESCAPE', 'ESCAPED', 'EVAL', 'EVALUATE', 'EXCEEDED', 'EXCEPT', 'EXCEPTION', 'EXCEPTIONS',
    'EXCLUSIVE', 'EXEC', 'EXECUTE', 'EXISTS', 'EXIT', 'EXPLAIN', 'EXPLODE', 'EXPORT', 'EXPRESSION',
    'EXTENDED', 'EXTERNAL', 'EXTRACT', 'FAIL', 'FALSE', 'FAMILY', 'FETCH', 'FIELDS', 'FILE',
    'FILTER', 'FILTERING', 'FINAL', 'FINISH', 'FIRST', 'FIXED', 'FLATTERN', 'FLOAT', 'FOR',
    'FORCE', 'FOREIGN', 'FORMAT', 'FORWARD', 'FOUND', 'FREE', 'FROM', 'FULL', 'FUNCTION',
    'FUNCTIONS', 'GENERAL', 'GENERATE', 'GET', 'GLOB', 'GLOBAL', 'GO', 'GOTO', 'GRANT', 'GREATER',
    'GROUP', 'GROUPING', 'HANDLER', 'HASH', 'HAVE', 'HAVING', 'HEAP', 'HIDDEN', 'HOLD', 'HOUR',
    'IDENTIFIED', 'IDENTITY', 'IF', 'IGNORE', 'IMMEDIATE', 'IMPORT', 'IN', 'INCLUDING', 'INCLUSIVE',
    'INCREMENT', 'INCREMENTAL', 'INDEX', 'INDEXED', 'INDEXES', 'INDICATOR', 'INFINITE', 'INITIALLY',
    'INLINE', 'INNER', 'INNTER', 'INOUT', 'INPUT', 'INSENSITIVE', 'INSERT', 'INSTEAD', 'INT',
    'INTEGER', 'INTERSECT', 'INTERVAL', 'INTO', 'INVALIDATE', 'IS', 'ISOLATION', 'ITEM', 'ITEMS',
    'ITERATE', 'JOIN', 'KEY', 'KEYS', 'LAG', 'LANGUAGE', 'LARGE', 'LAST', 'LATERAL', 'LEAD',
    'LEADING', 'LEAVE', 'LEFT', 'LENGTH', 'LESS', 'LEVEL', 'LIKE', 'LIMIT', 'LIMITED', 'LINES',
    'LIST', 'LOAD', 'LOCAL', 'LOCALTIME', 'LOCALTIMESTAMP', 'LOCATION', 'LOCATOR', 'LOCK',
    'LOCKS', 'LOG', 'LOGED', 'LONG', 'LOOP', 'LOWER', 'MAP', 'MATCH', 'MATERIALIZED', 'MAX',
    'MAXLEN', 'MEMBER', 'MERGE', 'METHOD', 'METRICS', 'MIN', 'MINUS', 'MINUTE', 'MISSING', 'MOD',
    'MODE', 'MODIFIES', 'MODIFY', 'MODULE', 'MONTH', 'MULTI', 'MULTISET', 'NAME', 'NAMES',
    'NATIONAL', 'NATURAL', 'NCHAR', 'NCLOB', 'NEW', 'NEXT', 'NO', 'NONE', 'NOT', 'NULL',
    'NULLIF', 'NUMBER', 'NUMERIC', 'OBJECT', 'OF', 'OFFLINE', 'OFFSET', 'OLD', 'ON', 'ONLINE',
    'ONLY', 'OPAQUE', 'OPEN', 'OPERATOR', 'OPTION', 'OR', 'ORDER', 'ORDINALITY', 'OTHER',
    'OTHERS', 'OUT', 'OUTER', 'OUTPUT', 'OVER', 'OVERLAPS', 'OVERRIDE', 'OWNER', 'PAD',
    'PARALLEL', 'PARAMETER', 'PARAMETERS', 'PARTIAL', 'PARTITION', 'PARTITIONED', 'PARTITIONS',
    'PATH', 'PERCENT', 'PERCENTILE', 'PERMISSION', 'PERMISSIONS', 'PIPE', 'PIPELINED', 'PLAN',
    'POOL', 'POSITION', 'PRECISION', 'PREPARE', 'PRESERVE', 'PRIMARY', 'PRIOR', 'PRIVATE',
    'PRIVILEGES', 'PROCEDURE', 'PROCESSED', 'PROJECT', 'PROJECTION', 'PROPERTY', 'PROVISIONING',
    'PUBLIC', 'PUT', 'QUERY', 'QUIT', 'QUORUM', 'RAISE', 'RANDOM', 'RANGE', 'RANK', 'RAW',
    'READ', 'READS', 'REAL', 'REBUILD', 'RECORD', 'RECURSIVE', 'REDUCE', 'REF', 'REFERENCE',
    'REFERENCES', 'REFERENCING', 'REGEXP', 'REGION', 'REINDEX', 'RELATIVE', 'RELEASE', 'REMAINDER',
    'RENAME', 'REPEAT', 'REPLACE', 'REQUEST', 'RESET', 'RESIGNAL', 'RESOURCE', 'RESPONSE',
    'RESTORE', 'RESTRICT', 'RESULT', 'RETURN', 'RETURNING', 'RETURNS', 'REVERSE', 'REVOKE',
    'RIGHT', 'ROLE', 'ROLES', 'ROLLBACK', 'ROLLUP', 'ROUTINE', 'ROW', 'ROWS', 'RULE', 'RULES',
    'SAMPLE', 'SATISFIES', 'SAVE', 'SAVEPOINT', 'SCAN', 'SCHEMA', 'SCOPE', 'SCROLL', 'SEARCH',
    'SECOND', 'SECTION', 'SEGMENT', 'SEGMENTS', 'SELECT', 'SELF', 'SEMI', 'SENSITIVE',
    'SEPARATE', 'SEQUENCE', 'SERIALIZABLE', 'SESSION', 'SET', 'SETS', 'SHARD', 'SHARE',
    'SHARED', 'SHORT', 'SHOW', 'SIGNAL', 'SIMILAR', 'SIZE', 'SKEWED', 'SMALLINT', 'SNAPSHOT',
    'SOME', 'SOURCE', 'SPACE', 'SPACES', 'SPARSE', 'SPECIFIC', 'SPECIFICTYPE', 'SPLIT', 'SQL',
    'SQLCODE', 'SQLERROR', 'SQLEXCEPTION', 'SQLSTATE', 'SQLWARNING', 'START', 'STATE', 'STATIC',
    'STATUS', 'STORAGE', 'STORE', 'STORED', 'STREAM', 'STRING', 'STRUCT', 'STYLE', 'SUB',
    'SUBMULTISET', 'SUBPARTITION', 'SUBSTRING', 'SUBTYPE', 'SUM', 'SUPER', 'SYMMETRIC', 'SYNONYM',
    'SYSTEM', 'TABLE', 'TABLESAMPLE', 'TEMP', 'TEMPORARY', 'TERMINATED', 'TEXT', 'THAN', 'THEN',
    'THROUGHPUT', 'TIME', 'TIMESTAMP', 'TIMEZONE', 'TINYINT', 'TO', 'TOKEN', 'TOTAL', 'TOUCH',
    'TRAILING', 'TRANSACTION', 'TRANSFORM', 'TRANSLATE', 'TRANSLATION', 'TREAT', 'TRIGGER',
    'TRIM', 'TRUE', 'TRUNCATE', 'TTL', 'TUPLE', 'TYPE', 'UNDER', 'UNDO', 'UNION', 'UNIQUE',
    'UNIT', 'UNKNOWN', 'UNLOGGED', 'UNNEST', 'UNPROCESSED', 'UNSIGNED', 'UNTIL', 'UPDATE',
    'UPPER', 'URL', 'USAGE', 'USE', 'USER', 'USERS', 'USING', 'UUID', 'VACUUM', 'VALUE',
    'VALUED', 'VALUES', 'VARCHAR', 'VARIABLE', 'VARIANCE', 'VARINT', 'VARYING', 'VIEW',
    'VIEWS', 'VIRTUAL', 'VOID', 'WAIT', 'WHEN', 'WHENEVER', 'WHERE', 'WHILE', 'WINDOW',
    'WITH', 'WITHIN', 'WITHOUT', 'WORK', 'WRAPPED', 'WRITE', 'YEAR', 'ZONE'
].map(word => word.toLowerCase()));
/**
 * Utility class for working with DynamoDB reserved words
 */
class ReservedWords {
    /**
     * Check if a word is a reserved word in DynamoDB
     * @param word - The word to check
     * @returns true if the word is reserved
     */
    static isReserved(word) {
        return exports.DYNAMODB_RESERVED_WORDS.has(word.toLowerCase());
    }
    /**
     * Get a list of all reserved words
     * @returns Array of all reserved words (lowercase)
     */
    static getAll() {
        return Array.from(exports.DYNAMODB_RESERVED_WORDS);
    }
    /**
     * Get an expression attribute name for a potentially reserved word
     * @param attributeName - The attribute name to check
     * @returns The attribute name with # prefix if reserved
     */
    static getExpressionName(attributeName) {
        if (this.isReserved(attributeName)) {
            return `#${attributeName}`;
        }
        return attributeName;
    }
}
exports.ReservedWords = ReservedWords;
/**
 * Utility class to handle DynamoDB reserved words and expression attribute names
 */
class ExpressionAttributeHandler {
    constructor() {
        this.expressionAttributeNames = {};
        this.attributeNameMap = new Map();
        this.nameCount = 0;
    }
    /**
     * Check if an attribute name is a reserved word
     */
    isReservedWord(attributeName) {
        return exports.DYNAMODB_RESERVED_WORDS.has(attributeName.toLowerCase());
    }
    /**
     * Get the expression attribute name for a given attribute
     * If it's a reserved word or contains special characters, returns the mapped name
     * Otherwise returns the original name
     */
    getExpressionAttributeName(attributeName) {
        // Handle nested attributes
        const parts = attributeName.split('.');
        const processedParts = parts.map(part => {
            if (this.isReservedWord(part) || part.includes('-') || part.includes(' ')) {
                if (!this.attributeNameMap.has(part)) {
                    const placeholder = `#n${++this.nameCount}`;
                    this.attributeNameMap.set(part, placeholder);
                    this.expressionAttributeNames[placeholder] = part;
                }
                return this.attributeNameMap.get(part);
            }
            return part;
        });
        return processedParts.join('.');
    }
    /**
     * Get all expression attribute names used
     */
    getExpressionAttributeNames() {
        return Object.keys(this.expressionAttributeNames).length > 0
            ? this.expressionAttributeNames
            : undefined;
    }
    /**
     * Process projection expression to handle reserved words
     */
    processProjectionExpression(attributes) {
        const processedAttributes = attributes.map(attr => this.getExpressionAttributeName(attr));
        return {
            projectionExpression: processedAttributes.join(', '),
            expressionAttributeNames: this.getExpressionAttributeNames()
        };
    }
    /**
     * Process key condition expression to handle reserved words
     */
    processKeyConditionExpression(expression) {
        let processedExpression = expression;
        // Find all attribute references (words not prefixed with : or #)
        const attributeMatches = expression.match(/(?<![:# ])\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
        for (const attr of attributeMatches) {
            if (this.isReservedWord(attr)) {
                const placeholder = this.getExpressionAttributeName(attr);
                processedExpression = processedExpression.replace(new RegExp(`\\b${attr}\\b(?!\\s*[=<>])`, 'g'), placeholder);
            }
        }
        return {
            keyConditionExpression: processedExpression,
            expressionAttributeNames: this.getExpressionAttributeNames()
        };
    }
    /**
     * Reset the handler state
     */
    reset() {
        this.expressionAttributeNames = {};
        this.attributeNameMap.clear();
        this.nameCount = 0;
    }
}
exports.ExpressionAttributeHandler = ExpressionAttributeHandler;
//# sourceMappingURL=reserved-words.js.map