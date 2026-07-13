/**
 * ProjectCard — Project list card with name, type badge, platforms, and metadata
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { PLATFORMS } from '../lib/social-platforms';
import styles from './ProjectCard.module.css';

interface ProjectCardData {
  _id: string;
  name: string;
  description?: string;
  type: 'single' | 'campaign';
  status: 'draft' | 'active' | 'completed' | 'archived';
  platforms: string[];
  assetCount: number;
  updatedAt: number;
}

interface ProjectCardProps {
  project: ProjectCardData;
  onClick: (id: string) => void;
  onDelete?: (id: string) => void;
}

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

const MoreIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="3" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="8" cy="13" r="1.25" />
  </svg>
);

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, closeMenu]);

  return (
    <div
      className={styles.card}
      onClick={() => onClick(project._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(project._id);
        }
      }}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.name}>{project.name}</h3>
        <div className={styles.headerRight}>
          <span className={styles.typeBadge} data-type={project.type}>
            {project.type === 'single' ? 'Single' : 'Campaign'}
          </span>
          {onDelete && (
            <div className={styles.menuWrapper} ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <IconButton
                icon={MoreIcon}
                attention="low"
                appearance="neutral"
                size="small"
                aria-label={`Options for ${project.name}`}
                onPress={() => setMenuOpen((v) => !v)}
              />
              {menuOpen && (
                <div className={styles.menuDropdown}>
                  <Button
                    attention="low"
                    appearance="negative"
                    size="small"
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onPress={() => { onDelete(project._id); closeMenu(); }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <p className={styles.description}>{project.description}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.platforms}>
          {project.platforms.map((pid) => {
            const platform = PLATFORMS.find((p) => p.id === pid);
            return platform ? (
              <span key={pid} className={styles.platformBadge}>
                {platform.label}
              </span>
            ) : null;
          })}
        </div>
        <span className={styles.meta}>
          {project.assetCount} asset{project.assetCount !== 1 ? 's' : ''}
          {' \u00b7 '}
          {getRelativeTime(project.updatedAt)}
        </span>
      </div>
    </div>
  );
}

interface NewProjectCardProps {
  onClick: () => void;
}

export function NewProjectCard({ onClick }: NewProjectCardProps) {
  return (
    <div
      className={styles.newCard}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.newCardIcon}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="10" y1="4" x2="10" y2="16" />
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </div>
      <span className={styles.newCardLabel}>New Project</span>
    </div>
  );
}
