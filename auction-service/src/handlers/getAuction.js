import AWS from 'aws-sdk';
import commonMiddleware from '../lib/common-middleware';

import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
        let auction;
        try {
                const result = await dynamodb
                        .get({
                                TableName: process.env.AUCTIONS_TABLE_NAME,
                                Key: { id },
                        })
                        .promise();
                auction = result.Item;
        } catch (error) {
                throw new createError.InternalServerError(error);
        }

        if (!auction) {
                throw new createError.NotFound(
                        `Auction with id ${id} is not found!`
                );
        }

        return auction;
}

async function getAuction(event, context) {
        const { id } = event.pathParameters;

        let auction = await getAuctionById(id);

        return {
                statusCode: 201,
                body: JSON.stringify({ auction }),
        };
}

export const handler = commonMiddleware(getAuction);
