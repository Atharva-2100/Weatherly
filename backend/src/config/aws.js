const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const environment = require('./environment');

let docClientInstance = null;
let rawDynamoClientInstance = null;

function getDynamoDBClient() {
  if (!rawDynamoClientInstance) {
    const clientConfig = {
      region: environment.AWS_REGION
    };

    // If local endpoint is specified (e.g. DynamoDB Local http://localhost:8000)
    if (environment.DYNAMODB_ENDPOINT) {
      clientConfig.endpoint = environment.DYNAMODB_ENDPOINT;
      clientConfig.credentials = {
        accessKeyId: environment.AWS_ACCESS_KEY_ID || 'localKey',
        secretAccessKey: environment.AWS_SECRET_ACCESS_KEY || 'localSecret'
      };
    } else if (environment.AWS_ACCESS_KEY_ID && environment.AWS_SECRET_ACCESS_KEY) {
      // Explicit credentials from environment
      clientConfig.credentials = {
        accessKeyId: environment.AWS_ACCESS_KEY_ID,
        secretAccessKey: environment.AWS_SECRET_ACCESS_KEY
      };
    }
    // Otherwise AWS SDK automatically falls back to IAM roles (Lambda execution role / EC2 / ECS instance profile)

    rawDynamoClientInstance = new DynamoDBClient(clientConfig);
  }
  return rawDynamoClientInstance;
}

function getDocumentClient() {
  if (!docClientInstance) {
    const rawClient = getDynamoDBClient();
    docClientInstance = DynamoDBDocumentClient.from(rawClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true
      }
    });
  }
  return docClientInstance;
}

module.exports = {
  getDynamoDBClient,
  getDocumentClient
};
