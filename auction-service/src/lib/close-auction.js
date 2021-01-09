import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
export async function closeAuction(auction) {
        const params = {
                TableName: process.env.AUCTIONS_TABLE_NAME,
                Key: { id: auction.id },
                UpdateExpression: 'set #status = :status',
                ExpressionAttributeValues: {
                        ':status': 'CLOSED',
                },
                ExpressionAttributeNames: {
                        '#status': 'status',
                },
        };

        await dynamodb.update(params).promise();
        const { title, seller, highestBid } = auction;
        const { amount, bidder } = highestBid;

        if (amount === 0) {
                await sqs
                        .sendMessage({
                                QueueUrl: process.env.MAIL_QUEUE_URL,
                                MessageBody: JSON.stringify({
                                        subject: 'No bid on your auction item!',
                                        body: `Your item ${title} did not get any bids, better luck next time!`,
                                        recipient: seller,
                                }),
                        })
                        .promise();
                return;
        }
        const notifySeller = sqs
                .sendMessage({
                        QueueUrl: process.env.MAIL_QUEUE_URL,
                        MessageBody: JSON.stringify({
                                subject: 'Your Item has been sold!',
                                body: `Your item ${title} has been sold for ${amount}!`,
                                recipient: seller,
                        }),
                })
                .promise();

        const notifyBuyer = sqs
                .sendMessage({
                        QueueUrl: process.env.MAIL_QUEUE_URL,
                        MessageBody: JSON.stringify({
                                subject: 'You won the auction!',
                                body: `Whata great deal! you got yourself a ${title} for $${amount}.`,
                                recipient: bidder,
                        }),
                })
                .promise();

        return Promise.all([notifySeller, notifyBuyer]);
}
