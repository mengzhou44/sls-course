import validator from '@middy/validator';

export default function getValidator() {
        const inputSchema = {
                properties: {
                        queryStringParameters: {
                                type: 'object',
                                properties: {
                                        status: {
                                                type: 'string',
                                                enum: ['OPEN', 'CLOSED'],
                                                default: 'OPEN',
                                        },
                                },
                        },
                },
                required: ['queryStringParameters'],
        };

        return validator({ inputSchema, useDefault: true });
}
