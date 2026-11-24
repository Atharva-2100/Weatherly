/**
 * Script to create DynamoDB tables in AWS or local DynamoDB instance
 * Run: node scripts/createTables.js
 */

const {
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTimeToLiveCommand
} = require('@aws-sdk/client-dynamodb');
const { getDynamoDBClient } = require('../src/config/aws');
const environment = require('../src/config/environment');

const client = getDynamoDBClient();

const tableDefinitions = [
  // 1. WeatherHistory Table
  {
    TableName: environment.TABLES.WEATHER_HISTORY,
    KeySchema: [
      { AttributeName: 'city', KeyType: 'HASH' }, // Partition Key
      { AttributeName: 'recordedAt', KeyType: 'RANGE' } // Sort Key
    ],
    AttributeDefinitions: [
      { AttributeName: 'city', AttributeType: 'S' },
      { AttributeName: 'recordedAt', AttributeType: 'S' },
      { AttributeName: 'recordId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'RecordIdIndex',
        KeySchema: [
          { AttributeName: 'recordId', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    ttlAttribute: 'ttl'
  },

  // 2. FavouriteLocations Table
  {
    TableName: environment.TABLES.FAVORITES,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }, // Partition Key
      { AttributeName: 'cityId', KeyType: 'RANGE' } // Sort Key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'cityId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  // 3. UserPreferences Table
  {
    TableName: environment.TABLES.PREFERENCES,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' } // Partition Key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  // 4. WeatherCache Table
  {
    TableName: environment.TABLES.CACHE,
    KeySchema: [
      { AttributeName: 'cacheKey', KeyType: 'HASH' } // Partition Key
    ],
    AttributeDefinitions: [
      { AttributeName: 'cacheKey', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    ttlAttribute: 'ttl'
  }
];

async function createTableIfNotExists(tableDef) {
  const tableName = tableDef.TableName;
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`[DynamoDB] Table "${tableName}" already exists.`);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException' || err.message?.includes('not found')) {
      console.log(`[DynamoDB] Creating table "${tableName}"...`);
      const { ttlAttribute, ...createCommandInput } = tableDef;
      await client.send(new CreateTableCommand(createCommandInput));
      console.log(`[DynamoDB] Table "${tableName}" created successfully.`);

      if (ttlAttribute) {
        try {
          await client.send(new UpdateTimeToLiveCommand({
            TableName: tableName,
            TimeToLiveSpecification: {
              Enabled: true,
              AttributeName: ttlAttribute
            }
          }));
          console.log(`[DynamoDB] Enabled TTL on "${tableName}" (attribute: ${ttlAttribute}).`);
        } catch (ttlErr) {
          console.warn(`[DynamoDB] Warning: Could not enable TTL on "${tableName}":`, ttlErr.message);
        }
      }
    } else {
      console.error(`[DynamoDB] Error checking table "${tableName}":`, err.message);
    }
  }
}

async function main() {
  console.log('====================================================');
  console.log(` Initializing DynamoDB Tables (Region: ${environment.AWS_REGION})`);
  console.log('====================================================');

  for (const tableDef of tableDefinitions) {
    await createTableIfNotExists(tableDef);
  }

  console.log('Done creating DynamoDB tables.');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { main, tableDefinitions };
