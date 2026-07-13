/**
 * useFigmaConnection.ts
 *
 * Hook for managing Figma connection state
 */

'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { useCallback, useMemo } from 'react';
import type { FigmaConnection, FigmaConnectionStatus } from '@oneui/shared';

export interface UseFigmaConnectionOptions {
  brandId: string | null;
}

export interface UseFigmaConnectionReturn {
  /** The current Figma connection (if any) */
  connection: FigmaConnection | null;
  /** Whether the connection data is loading */
  isLoading: boolean;
  /** Whether the brand is connected to Figma */
  isConnected: boolean;
  /** Whether the connection has expired */
  isExpired: boolean;
  /** Current connection status */
  status: FigmaConnectionStatus | null;
  /** Initiate OAuth flow to connect to Figma */
  connect: (fileKey: string) => void;
  /** Disconnect from Figma */
  disconnect: () => Promise<void>;
}

/**
 * Hook for managing Figma connection state
 */
export function useFigmaConnection({
  brandId,
}: UseFigmaConnectionOptions): UseFigmaConnectionReturn {
  // Query connection data from Convex
  const connectionData = useQuery(
    api.figmaConnections.getByBrand,
    brandId ? { brandId: brandId as any } : 'skip'
  );

  // Disconnect mutation
  const disconnectMutation = useMutation(api.figmaConnections.disconnect);

  // Derived state
  const isLoading = connectionData === undefined;
  const connection = connectionData
    ? ({
        id: connectionData.id as string,
        brandId: connectionData.brandId as string,
        userId: connectionData.userId,
        fileKey: connectionData.fileKey,
        fileName: connectionData.fileName,
        status: connectionData.status,
        lastSyncedAt: connectionData.lastSyncedAt,
        createdAt: connectionData.createdAt,
        updatedAt: connectionData.updatedAt,
      } as FigmaConnection)
    : null;

  const status = connection?.status ?? null;
  const isConnected = status === 'active';
  const isExpired = status === 'expired';

  /**
   * Initiate OAuth flow to connect to Figma
   */
  const connect = useCallback(
    (fileKey: string) => {
      if (!brandId) {
        console.error('No brand ID provided');
        return;
      }

      // Build OAuth URL and redirect
      const params = new URLSearchParams({
        brandId,
        fileKey,
        returnUrl: window.location.pathname,
      });

      window.location.href = `/api/auth/figma?${params.toString()}`;
    },
    [brandId]
  );

  /**
   * Disconnect from Figma
   */
  const disconnect = useCallback(async () => {
    if (!brandId) {
      throw new Error('No brand ID provided');
    }

    await disconnectMutation({
      brandId: brandId as any,
      userId: 'current-user', // TODO: Get from auth context
    });
  }, [brandId, disconnectMutation]);

  return useMemo(
    () => ({
      connection,
      isLoading,
      isConnected,
      isExpired,
      status,
      connect,
      disconnect,
    }),
    [connection, isLoading, isConnected, isExpired, status, connect, disconnect]
  );
}
