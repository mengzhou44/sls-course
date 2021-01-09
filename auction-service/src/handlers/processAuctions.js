import { closeAuction } from '../lib/close-auction';
import { getEndedAuctions } from '../lib/get-ended-auctions';
import createError from 'http-errors';

async function processAuctions() {
        try {
                const auctionsToClose = await getEndedAuctions();
                const closeAllPromises = auctionsToClose.map((auction) =>
                        closeAuction(auction)
                );
                await Promise.all(closeAllPromises);
                return closeAllPromises.length;
        } catch (error) {
                throw new createError.InternalServerError(error);
        }
}

export const handler = processAuctions;
