import validator from '@middy/validator';

export default function getValidator() {
        const inputSchema = {
                properties: {
                        body: {
                                type: 'object',
                                properties: {
                                       amount: {
                                                type: 'number'
                                        },
                                },
                                required: ['amount']
                        },
                },
                required: ['body'],
        };

        return validator({ inputSchema });
}
