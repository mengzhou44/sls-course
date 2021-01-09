import validator from '@middy/validator';

export default function getValidator() {
        const inputSchema = {
                properties: {
                        body: {
                                type: 'object',
                                properties: {
                                        title: {
                                                type: 'string'
                                        },
                                },
                                required: ['title']
                        },
                },
                required: ['body'],
        };

        return validator({ inputSchema });
}
