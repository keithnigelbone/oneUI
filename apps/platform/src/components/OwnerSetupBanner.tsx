'use client';

/**
 * OwnerSetupBanner.tsx
 *
 * One-time first-run setup. While NO platform owner exists yet, a signed-in user
 * sees a "Become owner" prompt that runs `users.bootstrapFirstOwner` (claims the
 * owner role) then `migrations.backfillBrandOwnership` (assigns existing brands)
 * — both with the user's real session, which the Convex dashboard / CLI can't
 * provide. Renders nothing once an owner exists, so it's safe to always mount.
 */

import React, { useCallback, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Surface } from '@oneui/ui/components/Surface';
import { Button } from '@oneui/ui/components/Button';
import { authClient } from '@/lib/auth-client';
import styles from './OwnerSetupBanner.module.css';

export function OwnerSetupBanner(): React.ReactElement | null {
  const { data: session } = authClient.useSession();
  const hasOwner = useQuery(api.users.hasPlatformOwner, {});
  const bootstrap = useMutation(api.users.bootstrapFirstOwner);
  const backfill = useMutation(api.migrations.backfillBrandOwnership);
  const claimThreads = useMutation(api.migrations.claimLegacyLocalUserThreads);
  const [busy, setBusy] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetup = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      // bootstrap claims the owner role; skip it on a retry where only a later
      // (idempotent) backfill step failed, so the owner is never claimed twice.
      if (!bootstrapped) {
        await bootstrap({});
        setBootstrapped(true);
      }
      // Both backfills are idempotent, so a retry after a transient failure
      // re-runs them safely and never abandons partially-claimed brands/threads.
      const res = await backfill({});
      await claimThreads({});
      setDone(
        `You're the platform owner${
          res ? ` — claimed ${res.membershipsCreated} existing brand(s)` : ''
        }.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setBusy(false);
    }
  }, [bootstrap, backfill, claimThreads, bootstrapped]);

  // Show while signed in AND (no owner yet, OR we just finished, OR setup
  // started but a later step failed and still needs a retry). The last case
  // keeps the banner mounted after bootstrap flips `hasOwner` true so the
  // partially-completed backfill isn't silently abandoned.
  if (!session?.user) return null;
  if (hasOwner !== false && !done && !bootstrapped) return null;

  return (
    <Surface mode="subtle" appearance="informative" className={styles.banner} role="status">
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.text}>
            {done ?? 'Set up this workspace — become the platform owner and claim existing brands.'}
          </span>
          {error && <span className={styles.error}>{error}</span>}
          {!done && (
            <Button attention="high" size="small" onPress={handleSetup} disabled={busy}>
              {busy ? 'Setting up…' : error ? 'Retry setup' : 'Become owner'}
            </Button>
          )}
        </div>
      </div>
    </Surface>
  );
}
