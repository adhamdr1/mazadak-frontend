import axios from 'axios';
import { apiClient } from './apiClient';

export interface GraphQLErrorExtensions {
  code?: string;
  status?: number;
  originalError?: {
    message?: string | string[];
    statusCode?: number;
  };
}

export interface GraphQLErrorItem {
  message: string;
  extensions?: GraphQLErrorExtensions;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLErrorItem[];
}

/**
 * Parses and extracts user-friendly or semantic error code from GraphQL error item.
 * Supports NestJS Class-Validator array messages, custom extensions, and HTTP status codes.
 */
export function parseGraphQLErrorItem(error: GraphQLErrorItem): string {
  const origMsg = error.extensions?.originalError?.message;
  if (Array.isArray(origMsg) && origMsg.length > 0) {
    return origMsg.join('. ');
  }
  if (typeof origMsg === 'string' && origMsg.trim().length > 0) {
    return origMsg;
  }
  if (typeof error.message === 'string' && error.message !== 'Bad Request Exception') {
    return error.message;
  }
  return error.extensions?.code || error.message || 'GENERIC_ERROR';
}

/**
 * Universal, type-safe GraphQL executor with centralized error handling.
 */
export async function executeGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await apiClient.post<GraphQLResponse<T>>('', {
      query,
      variables,
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      throw new Error(parseGraphQLErrorItem(response.data.errors[0]));
    }

    if (!response.data?.data) {
      throw new Error('GENERIC_ERROR');
    }

    return response.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const graphqlErrors = err.response?.data?.errors;
      if (Array.isArray(graphqlErrors) && graphqlErrors.length > 0) {
        throw new Error(parseGraphQLErrorItem(graphqlErrors[0]));
      }
      if (!err.response) {
        throw new Error('NETWORK_ERROR');
      }
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('GENERIC_ERROR');
  }
}
