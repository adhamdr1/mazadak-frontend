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
  UserWallet,
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

export const WALLET_UPDATED_SUBSCRIPTION = `
  subscription OnWalletUpdated {
    walletUpdated {
      _id
      userId
      balance
      heldBalance
      availableBalance
      createdAt
      updatedAt
    }
  }
`;

// ----------------------------------------------------
// Bids Service Implementation
// ----------------------------------------------------

const MY_WALLET_QUERY = `
  query MyWallet {
    myWallet {
      _id
      userId
      balance
      heldBalance
      availableBalance
      createdAt
      updatedAt
    }
  }
`;

export const bidsService = {
  /**
   * Fetch current user's wallet balance summary
   */
  async getMyWallet(): Promise<UserWallet> {
    const data = await executeGraphQL<{ myWallet: UserWallet }>(MY_WALLET_QUERY);
    return data.myWallet;
  },

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
   * Employs direct query with fallback to auto-bids list for 100% backend resilience
   */
  async getMyAutoBid(auctionId: string): Promise<AutoBid | null> {
    try {
      const data = await executeGraphQL<{ myAutoBid: AutoBid | null }>(
        MY_AUTO_BID_QUERY,
        { auctionId }
      );
      if (data?.myAutoBid) {
        return data.myAutoBid;
      }
    } catch {
      // Gracefully attempt fallback
    }

    try {
      const listData = await executeGraphQL<{ myAutoBids: AutoBidsPage }>(
        MY_AUTO_BIDS_QUERY,
        { input: { page: 1, limit: 50 }, status: 'ACTIVE' }
      );
      const found = listData?.myAutoBids?.items?.find(
        (item) => String(item.auctionId) === String(auctionId)
      );
      if (found) {
        return found;
      }
    } catch {
      // Fallback exhausted
    }

    return null;
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
   * Fetch consolidated user bidding statistics in a single unified GraphQL query
   */
  async getMyBidsStats(): Promise<{
    totalBids: number;
    winningBids: number;
    outbidBids: number;
  }> {
    try {
      const data = await executeGraphQL<{
        allBids: { total: number };
        winningBids: { total: number };
        outbidBids: { total: number };
      }>(`
        query MyBidsStats {
          allBids: myBids(input: { page: 1, limit: 1 }) {
            total
          }
          winningBids: myBids(input: { page: 1, limit: 1 }, filter: { status: WINNING }) {
            total
          }
          outbidBids: myBids(input: { page: 1, limit: 1 }, filter: { status: OUTBID }) {
            total
          }
        }
      `);

      return {
        totalBids: data?.allBids?.total ?? 0,
        winningBids: data?.winningBids?.total ?? 0,
        outbidBids: data?.outbidBids?.total ?? 0,
      };
    } catch {
      return {
        totalBids: 0,
        winningBids: 0,
        outbidBids: 0,
      };
    }
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

  /**
   * Subscribe to real-time wallet updates for the current authenticated user via WebSocket
   */
  subscribeToWalletUpdated(
    handlers: {
      next: (data: { walletUpdated: UserWallet }) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): () => void {
    return subscribeToSubscription<{ walletUpdated: UserWallet }>(
      {
        query: WALLET_UPDATED_SUBSCRIPTION,
      },
      handlers,
      token
    );
  },
};
