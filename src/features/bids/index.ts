/**
 * Bids Feature Module
 * Unified Barrel Export per AGENTS.md Pattern
 */

// Components
export { LiveBiddingBox } from './components/LiveBiddingBox';
export { AutoBidModal } from './components/AutoBidModal';

// Hooks
export { useLiveBids } from './hooks/useLiveBids';
export { usePlaceBid } from './hooks/usePlaceBid';
export { useAutoBid } from './hooks/useAutoBid';

// Services
export { bidsService } from './services/bids.service';

// Schemas
export { createPlaceBidSchema, placeBidBaseSchema } from './schemas/placeBid.schema';
export { createAutoBidSchema } from './schemas/autoBid.schema';

// Types
export * from './types/bids.types';
