import { useEffect, useState } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/components/Icon';
import { Surface } from '@oneui/ui/components/Surface';
import { fetchBugDetailFromApi } from '@/services/notion/notionService';
import type { NotionBug, NotionBugDetail } from '@/services/notion/types';
import styles from '@/styles/qa-dashboard.module.css';

type BugDetailsDrawerProps = {
  bug: NotionBug | null;
  open: boolean;
  onClose: () => void;
};

function formatDateTime(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.drawerRow}>
      <dt className={styles.drawerLabel}>{label}</dt>
      <dd className={styles.drawerValue}>{value || '—'}</dd>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className={styles.drawerSkeleton} aria-hidden>
      <div className={styles.drawerSkeletonLine} />
      <div className={styles.drawerSkeletonLine} />
      <div className={styles.drawerSkeletonBlock} />
      <div className={styles.drawerSkeletonLine} />
      <div className={styles.drawerSkeletonLine} />
    </div>
  );
}

export function BugDetailsDrawer({ bug, open, onClose }: BugDetailsDrawerProps) {
  const [detail, setDetail] = useState<NotionBugDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !bug) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchBugDetailFromApi(bug.id)
      .then((payload) => {
        if (!cancelled) setDetail(payload);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bug details');
          setDetail({ ...bug, description: '', prLink: '', devLink: '', comments: [] });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bug, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const activeBug = detail ?? bug;

  if (!open || !bug || !activeBug) return null;

  return (
    <div className={styles.drawerRoot}>
      <button
        type="button"
        className={styles.drawerBackdrop}
        aria-label="Close bug details"
        onClick={onClose}
      />
      <aside
        className={styles.drawerPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-drawer-title"
      >
        <header className={styles.drawerHeader}>
          <div>
            <p className={styles.drawerEyebrow}>{activeBug.bugId}</p>
            <h2 id="bug-drawer-title" className={styles.drawerTitle}>
              {activeBug.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size={8}
            appearance="neutral"
            aria-label="Close drawer"
            onClick={onClose}
            start={<Icon icon="close" size="3.5" aria-hidden />}
          />
        </header>

        {error ? (
          <Surface mode="subtle" appearance="warning" className={styles.drawerBanner}>
            <p className={styles.drawerBannerText}>{error}</p>
          </Surface>
        ) : null}

        {loading ? (
          <DrawerSkeleton />
        ) : (
          <div className={styles.drawerBody}>
            <section className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Bug information</h3>
              <dl className={styles.drawerGrid}>
                <DetailRow label="Platform" value={activeBug.platform} />
                <DetailRow label="Severity" value={activeBug.severity} />
                <DetailRow label="Component" value={activeBug.component} />
                <DetailRow label="Category" value={activeBug.category} />
                <DetailRow label="Assignee" value={activeBug.assignee} />
                <DetailRow label="Reporter" value={activeBug.reportedBy} />
                <DetailRow label="Status" value={activeBug.status} />
              </dl>
              <div className={styles.drawerDescription}>
                <p className={styles.drawerLabel}>Description</p>
                <p className={styles.drawerDescriptionText}>
                  {detail?.description?.trim() || 'No description provided.'}
                </p>
              </div>
            </section>

            <section className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Timeline</h3>
              <dl className={styles.drawerGrid}>
                <DetailRow label="Created" value={formatDateTime(activeBug.createdAt)} />
                <DetailRow label="Last updated" value={formatDateTime(activeBug.updatedAt)} />
              </dl>
            </section>

            <section className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Development</h3>
              <dl className={styles.drawerGrid}>
                <div className={styles.drawerRow}>
                  <dt className={styles.drawerLabel}>PR link</dt>
                  <dd className={styles.drawerValue}>
                    {detail?.prLink ? (
                      <a href={detail.prLink} target="_blank" rel="noopener noreferrer">
                        {detail.prLink}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div className={styles.drawerRow}>
                  <dt className={styles.drawerLabel}>GitHub / GitLab</dt>
                  <dd className={styles.drawerValue}>
                    {detail?.devLink ? (
                      <a href={detail.devLink} target="_blank" rel="noopener noreferrer">
                        {detail.devLink}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.drawerSection}>
              <h3 className={styles.drawerSectionTitle}>Comments</h3>
              {detail?.comments?.length ? (
                <ul className={styles.commentList}>
                  {detail.comments.map((comment) => (
                    <li key={comment.id} className={styles.commentItem}>
                      <p className={styles.commentMeta}>
                        <strong>{comment.author}</strong>
                        <span>{formatDateTime(comment.createdAt)}</span>
                      </p>
                      <p className={styles.commentText}>{comment.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.drawerEmpty}>No comments yet.</p>
              )}
              <p className={styles.drawerFutureNote}>
                Add and edit comments will be supported in a future release.
              </p>
            </section>
          </div>
        )}

        <footer className={styles.drawerFooter}>
          <Button
            variant="subtle"
            size={8}
            appearance="primary"
            end={<Icon icon="externalLink" size="3.5" aria-hidden />}
            onClick={() => window.open(activeBug.notionUrl, '_blank', 'noopener,noreferrer')}
          >
            Open in Notion
          </Button>
        </footer>
      </aside>
    </div>
  );
}
