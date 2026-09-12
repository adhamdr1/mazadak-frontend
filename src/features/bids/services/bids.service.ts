/**
 * Bids Service
 * GraphQL API calls for Bids Module — Pure production GraphQL connected directly to NestJS Backend
 */

import { executeGraphQL } from '@/services/api/graphqlClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  Bid,
  AutoBid,
  BidAddedPayload,
  BidsPage,
  AutoBidsPage,
  PaginationInput,
  BidsFilterInput,
  PlaceBidInput,
  SetAutoBidInput,
  CancelAutoBidInput,
  AutoBidStatus,
} from '../types/bids.types';

// ----------------------------------------------------
// GraphQL Fragments & Operations
// ----------------------------------------------------

const BID_FIELDS_FRAGMENT = `
  fragment BidFields on Bid {
    _id
    auctionId
    bidderId
    amount
    status
    createdAt
    updatedAt
  }
`;

const AUTO_BID_FIELDS_FRAGMENT = `
  fragment AutoBidFields on AutoBid {
    _id
    auctionId
    userId
    maxAmount
    status
    createdAt
    updatedAt
  }
`;

const PLACE_BID_MUTATION = `
  ${BID_FIELDS_FRAGMENT}
  mutation PlaceBid($input: PlaceBidInput!) {
    placeBid(input: $input) {
      ...BidFields
    }
  }
`;

const SET_AUTO_BID_MUTATION = `
  ${AUTO_BID_FIELDS_FRAGMENT}
  mutation SetAutoBid($input: SetAutoBidInput!) {
    setAutoBid(input: $input) {
      ...AutoBidFields
    }
  }
`;

const CANCEL_AUTO_BID_MUTATION = `
  mutation CancelAutoBid($input: CancelAutoBidInput!) {
    cancelAutoBid(input: $input)
  }
`;

const MY_AUTO_BID_QUERY = `
  ${AUTO_BID_FIELDS_FRAGMENT}
  query MyAutoBid($auctionId: ID!) {
    myAutoBid(auctionId: $auctionId) {
      ...AutoBidFields
    }
  }
`;

const MY_AUTO_BIDS_QUERY = `
  ${AUTO_BID_FIELDS_FRAGMENT}
  query MyAutoBids($input: PaginationInput!, $status: AutoBidStatus) {
    myAutoBids(input: $input, status: $status) {
      items {
        ...AutoBidFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

const AUCTION_BIDS_QUERY = `
  ${BID_FIELDS_FRAGMENT}
  query AuctionBids($auctionId: String!, $input: PaginationInput!, $filter: BidsFilterInput) {
    auctionBids(auctionId: $auctionId, input: $input, filter: $filter) {
      items {
        ...BidFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

const MY_BIDS_QUERY = `
  ${BID_FIELDS_FRAGMENT}
  query MyBids($input: PaginationInput!, $filter: BidsFilterInput) {
    myBids(input: $input, filter: $filter) {
      items {
        ...BidFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

export const BID_ADDED_SUBSCRIPTION = `
  ${BID_FIELDS_FRAGMENT}
  subscription OnBidAdded($auctionId: ID!) {
    bidAdded(auctionId: $auctionId) {
      bid {
        ...BidFields
      }
      currentPrice
      leadingBidderId
      bidCount
    }
  }
`;

// ----------------------------------------------------
// Bids Service Implementation
// ----------------------------------------------------

export const bidsService = {
  /**
   * Place a manual bid on an active auction
   */
  async placeBid(input: PlaceBidInput): Promise<Bid> {
    const data = await executeGraphQL<{ placeBid: Bid }>(PLACE_BID_MUTATION, {
      input,
    });
    return data.placeBid;
  },

  /**
   * Configure auto-bidding ceiling on an auction
   */
  async setAutoBid(input: SetAutoBidInput): Promise<AutoBid> {
    const data = await executeGraphQL<{ setAutoBid: AutoBid }>(
      SET_AUTO_BID_MUTATION,
      { input }
    );
    return data.setAutoBid;
  },

  /**
   * Cancel active auto-bidding on an auction
   */
  async cancelAutoBid(input: CancelAutoBidInput): Promise<boolean> {
    const data = await executeGraphQL<{ cancelAutoBid: boolean }>(
      CANCEL_AUTO_BID_MUTATION,
      { input }
    );
    return data.cancelAutoBid;
  },

  /**
   * Fetch current user's auto-bid configuration for a specific auction
   */
  async getMyAutoBid(auctionId: string): Promise<AutoBid | null> {
    const data = await executeGraphQL<{ myAutoBid: AutoBid | null }>(
      MY_AUTO_BID_QUERY,
      { auctionId }
    );
    return data.myAutoBid;
  },

  /**
   * Fetch user's auto-bids list with pagination and status filtering
   */
  async getMyAutoBids(
    input: PaginationInput,
    status?: AutoBidStatus
  ): Promise<AutoBidsPage> {
    const data = await executeGraphQL<{ myAutoBids: AutoBidsPage }>(
      MY_AUTO_BIDS_QUERY,
      { input, status }
    );
    return data.myAutoBids;
  },

  /**
   * Fetch public bids history for an auction
   */
  async getAuctionBids(
    auctionId: string,
    input: PaginationInput,
    filter?: BidsFilterInput
  ): Promise<BidsPage> {
    const data = await executeGraphQL<{ auctionBids: BidsPage }>(
      AUCTION_BIDS_QUERY,
      { auctionId, input, filter }
    );
    return data.auctionBids;
  },

  /**
   * Fetch current user's bids across all auctions
   */
  async getMyBids(
    input: PaginationInput,
    filter?: BidsFilterInput
  ): Promise<BidsPage> {
    const data = await executeGraphQL<{ myBids: BidsPage }>(MY_BIDS_QUERY, {
      input,
      filter,
    });
    return data.myBids;
  },

  /**
   * Subscribe to real-time bid updates for an auction via WebSocket
   */
  subscribeToBidAdded(
    auctionId: string,
    handlers: {
      next: (data: { bidAdded: BidAddedPayload }) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): () => void {
    return subscribeToSubscription<{ bidAdded: BidAddedPayload }>(
      {
        query: BID_ADDED_SUBSCRIPTION,
        variables: { auctionId },
      },
      handlers,
      token
    );
  },
};
