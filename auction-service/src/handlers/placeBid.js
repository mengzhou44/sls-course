import AWS from 'aws-sdk';
import commonMiddleware from '../lib/common-middleware';
import { getAuctionById } from './getAuction';

import createError from 'http-errors';
import getValidator from '../lib/validators/placeBidValidator';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
        const { id } = event.pathParameters;
        const { amount } = event.body;
        const { email } = event.requestContext.authorizer;
        let auction = await getAuctionById(id);

        if (auction.status === 'CLOSED') {
                throw new createError.Forbidden(
                        'Can not place a bid on a closed auction.'
                );
        }

        if (auction.highestBid.bidder === email) {
                throw new createError.Forbidden(
                        'You are  the highest bidder already!'
                );
        }

        if (auction.seller === email) {
                throw new createError.Forbidden(
                        'You can not bid on your own auction.'
                );
        }

        if (amount <= auction.highestBid.amount) {
                throw new createError.Forbidden(
                        `Can not place bid with the amount less than ${auction.highestBid.amount}`
                );
        }
        const params = {
                TableName: process.env.AUCTIONS_TABLE_NAME,
                Key: { id },
                UpdateExpression:
                        'set highestBid.amount = :amount, highestBid.bidder = :bidder',
                ExpressionAttributeValues: {
                        ':amount': amount,
                        ':bidder': email,
                },
                ReturnValues: 'ALL_NEW',
        };
        let updatedAuction;

        try {
                let result = await dynamodb.update(params).promise();
                updatedAuction = result.Attributes;
        } catch (error) {
                throw new createError.InternalServerError(error);
        }

        return {
                statusCode: 201,
                body: JSON.stringify({ updatedAuction }),
        };
}

export const handler = commonMiddleware(placeBid).use(getValidator());
