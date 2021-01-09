import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'eu-west-1' });
async function sendMail(event, context) {
        const record = event.Records[0];
        console.log(record);
        const { subject, body, recipient } = JSON.parse(record.body);
        const params = {
                Source: 'mengzhouaws@gmail.com',
                Destination: {
                        ToAddresses: [recipient],
                },
                Message: {
                        Body: {
                                Text: {
                                        Data: body,
                                },
                        },
                        Subject: {
                                Data: subject,
                        },
                },
        };

        try {
                const result = await ses.sendEmail(params).promise();
                return result;
        } catch (error) {
                console.log(error);
        }
}

export const handler = sendMail;
