"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
/**
 * This script tests if the DyndbClient can properly use AWS credentials
 * from the default AWS credential provider chain without explicitly providing them.
 *
 * IMPORTANT: Before running this test, make sure:
 * 1. You have AWS CLI configured or environment variables set
 * 2. Update the REGION and TABLE_NAME constants below
 * 3. Update the PRIMARY_KEY and PRIMARY_KEY_VALUE constants to match your table
 */
// CONFIGURE THESE VALUES FOR YOUR ENVIRONMENT
var REGION = 'us-east-1'; // Replace with your AWS region
var TABLE_NAME = 'dyndb-lib-demo-table-OpesearchSetupStack'; // Replace with your table name
var PRIMARY_KEY = 'id'; // Replace with your table's primary key attribute name
var PRIMARY_KEY_VALUE = '1'; // Replace with a valid value for testing
var SORT_KEY = 'timestamp';
var SORT_KEY_VALUE = 1740402120707;
function testCredentialProviderChain() {
    return __awaiter(this, void 0, void 0, function () {
        var hasEnvCredentials, db, readKey, readResult, errorMessage, scanResult, errorMessage, error_1;
        var _a;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log('\n=== AWS CREDENTIAL PROVIDER CHAIN TEST ===\n');
                    hasEnvCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
                    console.log("AWS credentials in environment variables: ".concat(hasEnvCredentials ? 'FOUND' : 'NOT FOUND'));
                    console.log('Note: Credentials might still be available from ~/.aws/credentials or instance profile');
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 4, , 5]);
                    console.log('\nInitializing DyndbClient without explicit credentials...');
                    db = new _1.DyndbClient({
                        region: REGION,
                        tableName: TABLE_NAME
                    });
                    console.log('✅ Client initialized successfully!');
                    console.log("   Region: ".concat(REGION));
                    console.log("   Table: ".concat(TABLE_NAME));
                    // Test with a read operation
                    console.log('\nTesting a simple read operation...');
                    readKey = (_a = {}, _a[PRIMARY_KEY] = PRIMARY_KEY_VALUE, _a[SORT_KEY] = SORT_KEY_VALUE, _a);
                    console.log("   Attempting to read item with key: ".concat(JSON.stringify(readKey)));
                    return [4 /*yield*/, db.read(readKey)];
                case 2:
                    readResult = _g.sent();
                    if (readResult.success) {
                        console.log('✅ Read operation successful!');
                        if (readResult.data) {
                            console.log("   Item found: ".concat(JSON.stringify(readResult.data)));
                        }
                        else {
                            console.log('   Item not found, but operation was successful (this is normal if the item doesn\'t exist)');
                        }
                    }
                    else {
                        console.error('❌ Read operation failed:');
                        console.error("   ".concat(((_b = readResult.error) === null || _b === void 0 ? void 0 : _b.message) || 'Unknown error'));
                        errorMessage = ((_c = readResult.error) === null || _c === void 0 ? void 0 : _c.message) || '';
                        if (errorMessage.includes('credentials')) {
                            console.error('\n➡️ This appears to be a CREDENTIAL issue. Please check:');
                            console.error('   - AWS CLI configuration: Run "aws configure" to set up credentials');
                            console.error('   - Environment variables: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
                        }
                        else if (errorMessage.includes('authority') || errorMessage.includes('validate')) {
                            console.error('\n➡️ This appears to be an AUTHENTICATION issue. Please check:');
                            console.error('   - If your credentials have the correct permissions');
                            console.error('   - If your credentials have expired');
                        }
                        else if (errorMessage.includes('ResourceNotFoundException')) {
                            console.error('\n➡️ The table was not found. Please check:');
                            console.error("   - If \"".concat(TABLE_NAME, "\" exists in the \"").concat(REGION, "\" region"));
                            console.error('   - If you have permission to access this table');
                        }
                        return [2 /*return*/]; // Stop testing if read fails
                    }
                    // Test with a scan operation
                    console.log('\nTesting a simple scan operation...');
                    console.log('   Attempting to scan the table with a limit of 5 items');
                    return [4 /*yield*/, db.executeScan({
                            limit: 5
                        })];
                case 3:
                    scanResult = _g.sent();
                    if (scanResult.success) {
                        console.log('✅ Scan operation successful!');
                        console.log("   Retrieved ".concat(((_d = scanResult.data) === null || _d === void 0 ? void 0 : _d.length) || 0, " items"));
                        if (scanResult.consumedCapacity) {
                            console.log("   Consumed capacity: ".concat(JSON.stringify(scanResult.consumedCapacity)));
                        }
                    }
                    else {
                        console.error('❌ Scan operation failed:');
                        console.error("   ".concat(((_e = scanResult.error) === null || _e === void 0 ? void 0 : _e.message) || 'Unknown error'));
                        errorMessage = ((_f = scanResult.error) === null || _f === void 0 ? void 0 : _f.message) || '';
                        if (errorMessage.includes('permission') || errorMessage.includes('authorize')) {
                            console.error('\n➡️ This appears to be a PERMISSION issue. Please check:');
                            console.error('   - If your IAM user/role has dynamodb:Scan permission');
                        }
                    }
                    console.log('\n=== TEST SUMMARY ===');
                    console.log("Client initialization: ".concat(true ? '✅ SUCCESS' : '❌ FAILED'));
                    console.log("Read operation: ".concat(readResult.success ? '✅ SUCCESS' : '❌ FAILED'));
                    console.log("Scan operation: ".concat(scanResult.success ? '✅ SUCCESS' : '❌ FAILED'));
                    console.log('\nIf all operations were successful, your credentials are correctly configured!');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _g.sent();
                    console.error('\n❌ Unexpected error:');
                    console.error(error_1);
                    console.error('\nPlease check the error message above for troubleshooting.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testCredentialProviderChain()
    .then(function () { return console.log('\nTest completed'); })
    .catch(function (err) { return console.error('\nTest failed with error:', err); });
