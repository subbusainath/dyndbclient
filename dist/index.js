"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamIteratorType = exports.ScanBuilder = exports.AttributePatterns = exports.DynamoDBAttributeType = exports.DyndbClient = void 0;
// Main entry point for the DynamoDB Client wrapper
const client_1 = require("./core/client");
Object.defineProperty(exports, "DyndbClient", { enumerable: true, get: function () { return client_1.DyndbClient; } });
const dynamodb_types_1 = require("./core/attributes/dynamodb-types");
Object.defineProperty(exports, "DynamoDBAttributeType", { enumerable: true, get: function () { return dynamodb_types_1.DynamoDBAttributeType; } });
Object.defineProperty(exports, "AttributePatterns", { enumerable: true, get: function () { return dynamodb_types_1.AttributePatterns; } });
const scan_builder_1 = require("./operations/scan-builder");
Object.defineProperty(exports, "ScanBuilder", { enumerable: true, get: function () { return scan_builder_1.ScanBuilder; } });
const stream_1 = require("./operations/stream");
Object.defineProperty(exports, "StreamIteratorType", { enumerable: true, get: function () { return stream_1.StreamIteratorType; } });
//# sourceMappingURL=index.js.map