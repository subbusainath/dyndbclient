import { DyndbClient } from '.';

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
const REGION = 'us-east-1';       // Replace with your AWS region
const TABLE_NAME = 'table-name';       // Replace with your table name
const PRIMARY_KEY = 'id';         // Replace with your table's primary key attribute name
const PRIMARY_KEY_VALUE = '1'; // Replace with a valid value for testing
const SORT_KEY = 'sort-key';
const SORT_KEY_VALUE = 'sort-key-value-based-on-type';
async function testCredentialProviderChain() {
    console.log('\n=== AWS CREDENTIAL PROVIDER CHAIN TEST ===\n');

    // Check for environment variables (one possible source)
    const hasEnvCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    console.log(`AWS credentials in environment variables: ${hasEnvCredentials ? 'FOUND' : 'NOT FOUND'}`);
    console.log('Note: Credentials might still be available from ~/.aws/credentials or instance profile');

    try {
        console.log('\nInitializing DyndbClient without explicit credentials...');

        // Initialize the client using only region and tableName
        // This should use the AWS credential provider chain
        const db = new DyndbClient({
            region: REGION,
            tableName: TABLE_NAME
        });

        console.log('✅ Client initialized successfully!');
        console.log(`   Region: ${REGION}`);
        console.log(`   Table: ${TABLE_NAME}`);

        // Test with a read operation
        console.log('\nTesting a simple read operation...');
        const readKey = { [PRIMARY_KEY]: PRIMARY_KEY_VALUE, [SORT_KEY]: SORT_KEY_VALUE };
        console.log(`   Attempting to read item with key: ${JSON.stringify(readKey)}`);

        const readResult = await db.read(readKey);

        if (readResult.success) {
            console.log('✅ Read operation successful!');
            if (readResult.data) {
                console.log(`   Item found: ${JSON.stringify(readResult.data)}`);
            } else {
                console.log('   Item not found, but operation was successful (this is normal if the item doesn\'t exist)');
            }
        } else {
            console.error('❌ Read operation failed:');
            console.error(`   ${readResult.error?.message || 'Unknown error'}`);

            // Check for common errors
            const errorMessage = readResult.error?.message || '';
            if (errorMessage.includes('credentials')) {
                console.error('\n➡️ This appears to be a CREDENTIAL issue. Please check:');
                console.error('   - AWS CLI configuration: Run "aws configure" to set up credentials');
                console.error('   - Environment variables: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
            } else if (errorMessage.includes('authority') || errorMessage.includes('validate')) {
                console.error('\n➡️ This appears to be an AUTHENTICATION issue. Please check:');
                console.error('   - If your credentials have the correct permissions');
                console.error('   - If your credentials have expired');
            } else if (errorMessage.includes('ResourceNotFoundException')) {
                console.error('\n➡️ The table was not found. Please check:');
                console.error(`   - If "${TABLE_NAME}" exists in the "${REGION}" region`);
                console.error('   - If you have permission to access this table');
            }

            return; // Stop testing if read fails
        }

        // Test with a scan operation
        console.log('\nTesting a simple scan operation...');
        console.log('   Attempting to scan the table with a limit of 5 items');

        const scanResult = await db.executeScan({
            limit: 5
        });

        if (scanResult.success) {
            console.log('✅ Scan operation successful!');
            console.log(`   Retrieved ${scanResult.data?.length || 0} items`);
            if (scanResult.consumedCapacity) {
                console.log(`   Consumed capacity: ${JSON.stringify(scanResult.consumedCapacity)}`);
            }
        } else {
            console.error('❌ Scan operation failed:');
            console.error(`   ${scanResult.error?.message || 'Unknown error'}`);

            // Check for common errors
            const errorMessage = scanResult.error?.message || '';
            if (errorMessage.includes('permission') || errorMessage.includes('authorize')) {
                console.error('\n➡️ This appears to be a PERMISSION issue. Please check:');
                console.error('   - If your IAM user/role has dynamodb:Scan permission');
            }
        }

        console.log('\n=== TEST SUMMARY ===');
        console.log(`Client initialization: ${true ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`Read operation: ${readResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`Scan operation: ${scanResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log('\nIf all operations were successful, your credentials are correctly configured!');

    } catch (error) {
        console.error('\n❌ Unexpected error:');
        console.error(error);
        console.error('\nPlease check the error message above for troubleshooting.');
    }
}

// Run the test
testCredentialProviderChain()
    .then(() => console.log('\nTest completed'))
    .catch(err => console.error('\nTest failed with error:', err)); 
