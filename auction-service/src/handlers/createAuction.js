import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/common-middleware';
import getValidator from '../lib/validators/createAuctionValidator';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
        const { title } = event.body;
        const {email} =  event.requestContext.authorizer
        const start = new Date();
        const end = new Date();
        end.setHours(start.getHours() + 1);
        const auction = {
                id: uuid(),
                title,
                status: 'OPEN',
                createdDate: start.toISOString(),
                endingAt: end.toISOString(),
                highestBid: {
                        amount: 0,
                },
                seller: email
        };

        try {
                await dynamodb
                        .put({
                                TableName: process.env.AUCTIONS_TABLE_NAME,
                                Item: auction,
                        })
                        .promise();

                return {
                        statusCode: 201,
                        body: JSON.stringify({ auction }),
                };
        } catch (error) {
                throw new createError.InternalServerError(error);
        }
}

export const handler = commonMiddleware(createAuction).use(getValidator());
