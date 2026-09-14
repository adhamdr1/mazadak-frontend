/**
 * Bids Feature Module
 * Unified Barrel Export per AGENTS.md Pattern
 */

// Components
export { LiveBiddingBox } from './components/LiveBiddingBox';
export { AutoBidModal } from './components/AutoBidModal';
export { AuctionBidHistory } from './components/AuctionBidHistory';
export { BidHistoryItem } from './components/BidHistoryItem';
export { BidHistorySkeleton } from './components/BidHistorySkeleton';
export { MyBidCard } from './components/MyBidCard';
export { MyBidsFilters } from './components/MyBidsFilters';
export { MyBidsSkeleton } from './components/MyBidsSkeleton';
export { MyBidsStats } from './components/MyBidsStats';

// Pages
export { MyBidsPage } from './pages/MyBidsPage';

// Hooks
export { useLiveBids } from './hooks/useLiveBids';
export { usePlaceBid } from './hooks/usePlaceBid';
export { useAutoBid } from './hooks/useAutoBid';
export { useAuctionBids } from './hooks/useAuctionBids';
export { useMyBids } from './hooks/useMyBids';

// Services
export { bidsService } from './services/bids.service';

// Schemas
export { createPlaceBidSchema, placeBidBaseSchema } from './schemas/placeBid.schema';
export { createAutoBidSchema } from './schemas/autoBid.schema';

// Types
export * from './types/bids.types';


