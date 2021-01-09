import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/common-middleware';
import getValidator from '../lib/validators/getAuctionsValidator';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
        let auctions;
        const { status } = event.queryStringParameters;

        const params = {
                TableName: process.env.AUCTIONS_TABLE_NAME,
                IndexName: 'statusAndEndDate',
                KeyConditionExpression: '#status = :status',
                ExpressionAttributeValues: {
                        ':status': status,
                },
                ExpressionAttributeNames: {
                        '#status': 'status',
                },
        };
        try {
                const result = await dynamodb.query(params).promise();
                auctions = result.Items;
                return {
                        statusCode: 201,
                        body: JSON.stringify({ auctions }),
                };
        } catch (error) {
                throw createError.InternalServerError(error);
        }
}

export const handler = commonMiddleware(getAuctions).use(getValidator());
