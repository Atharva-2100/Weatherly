/**
 * DynamoDB Service
 * Wraps AWS DocumentClient with robust error handling and an in-memory fallback
 * for local development and testing when AWS credentials or DynamoDB Local are not present.
 */

const {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb');
const { getDocumentClient } = require('../config/aws');
const { DynamoDBError } = require('../utils/errorHandler');

// In-Memory store for local dev when running without AWS or DynamoDB Local
const inMemoryStore = {
  tables: {}
};

function getTableStore(tableName) {
  if (!inMemoryStore.tables[tableName]) {
    inMemoryStore.tables[tableName] = new Map();
  }
  return inMemoryStore.tables[tableName];
}

class DynamoDBService {
  constructor() {
    this.isMockMode = false;
  }

  /**
   * Determine if we should use AWS DynamoDB or Fallback to Memory
   */
  async execute(operationName, params, awsFn, fallbackFn) {
    // If explicitly set or if no AWS credentials and no local endpoint, use in-memory store
    if (this.isMockMode) {
      return fallbackFn();
    }

    try {
      const docClient = getDocumentClient();
      return await awsFn(docClient);
    } catch (err) {
      // If connection refused (e.g. DynamoDB Local not running) or Missing credentials
      if (
        err.name === 'ResourceNotFoundException' ||
        err.name === 'UnrecognizedClientException' ||
        err.name === 'CredentialsProviderError' ||
        err.code === 'ECONNREFUSED' ||
        err.message?.includes('Cannot connect') ||
        err.message?.includes('Credentials')
      ) {
        console.warn(`[DynamoDBService] Notice: AWS DynamoDB not reachable (${err.message}). Using resilient in-memory local storage for ${operationName}.`);
        this.isMockMode = true;
        return fallbackFn();
      }
      console.error(`[DynamoDBService] Operation error ${operationName}:`, err);
      throw new DynamoDBError(`DynamoDB ${operationName} failed: ${err.message}`, err);
    }
  }

  async get(tableName, key) {
    return this.execute(
      'GetItem',
      { TableName: tableName, Key: key },
      async (client) => {
        const result = await client.send(new GetCommand({ TableName: tableName, Key: key }));
        return result.Item || null;
      },
      () => {
        const store = getTableStore(tableName);
        const storeKey = JSON.stringify(key);
        // Find matching key
        for (const [k, item] of store.entries()) {
          const match = Object.keys(key).every(pk => item[pk] === key[pk]);
          if (match) return item;
        }
        return null;
      }
    );
  }

  async put(tableName, item) {
    return this.execute(
      'PutItem',
      { TableName: tableName, Item: item },
      async (client) => {
        await client.send(new PutCommand({ TableName: tableName, Item: item }));
        return item;
      },
      () => {
        const store = getTableStore(tableName);
        const idKey = item.recordId || item.favoriteId || item.userId || item.cacheKey || `${item.city}_${item.recordedAt}`;
        store.set(idKey, { ...item });
        return item;
      }
    );
  }

  async delete(tableName, key) {
    return this.execute(
      'DeleteItem',
      { TableName: tableName, Key: key },
      async (client) => {
        await client.send(new DeleteCommand({ TableName: tableName, Key: key }));
        return true;
      },
      () => {
        const store = getTableStore(tableName);
        for (const [idKey, item] of store.entries()) {
          const match = Object.keys(key).every(pk => item[pk] === key[pk]);
          if (match) {
            store.delete(idKey);
            return true;
          }
        }
        return false;
      }
    );
  }

  async query(params) {
    return this.execute(
      'Query',
      params,
      async (client) => {
        const result = await client.send(new QueryCommand(params));
        return result.Items || [];
      },
      () => {
        const store = getTableStore(params.TableName);
        const items = Array.from(store.values());
        
        // Simple filter based on ExpressionAttributeValues
        if (params.ExpressionAttributeValues) {
          return items.filter(item => {
            return Object.entries(params.ExpressionAttributeValues).every(([valKey, targetVal]) => {
              // Extract attribute name if possible or match any field
              return Object.values(item).some(v => v === targetVal);
            });
          });
        }
        return items;
      }
    );
  }

  async scan(params) {
    return this.execute(
      'Scan',
      params,
      async (client) => {
        const result = await client.send(new ScanCommand(params));
        return result.Items || [];
      },
      () => {
        const store = getTableStore(params.TableName);
        return Array.from(store.values());
      }
    );
  }
}

module.exports = new DynamoDBService();
