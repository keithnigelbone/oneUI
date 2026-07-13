/**
 * MobileDrawer.tsx
 * Full-screen mobile navigation drawer using Base UI Dialog
 *
 * Features:
 * - Apple-style 3-level drill-down navigation
 * - Base UI Dialog for focus trap + portal + escape handling
 * - Uses real IconButton for back/close controls
 * - Cascading item reveal animation
 * - WCAG AA: role=dialog, aria-modal, focus management
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import styles from './WebHeader.module.css';
import type { MobileDrawerProps, NavItemL1, NavItemL2 } from './WebHeader.shared';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';

type DrawerScreen = 'l1' | 'l2' | 'l3';

function getScreenPosition(
  current: DrawerScreen,
  target: DrawerScreen
): 'left' | 'center' | 'right' {
  const order: DrawerScreen[] = ['l1', 'l2', 'l3'];
  const currentIdx = order.indexOf(current);
  const targetIdx = order.indexOf(target);

  if (currentIdx === targetIdx) return 'center';
  return currentIdx < targetIdx ? 'left' : 'right';
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onOpenChange,
  navigation = [],
  logo,
}) => {
  const [screen, setScreen] = useState<DrawerScreen>('l1');
  const [selectedL1, setSelectedL1] = useState<NavItemL1 | null>(null);
  const [selectedL2, setSelectedL2] = useState<NavItemL2 | null>(null);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset to L1 after close animation
    setTimeout(() => {
      setScreen('l1');
      setSelectedL1(null);
      setSelectedL2(null);
    }, 350);
  }, [onOpenChange]);

  const handleL1Click = useCallback(
    (item: NavItemL1) => {
      if (item.children && item.children.length > 0) {
        setSelectedL1(item);
        setScreen('l2');
      } else if (item.href) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleL2Click = useCallback(
    (item: NavItemL2) => {
      if (item.children && item.children.length > 0) {
        setSelectedL2(item);
        setScreen('l3');
      } else if (item.href) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleBack = useCallback(() => {
    if (screen === 'l3') {
      setScreen('l2');
      setSelectedL2(null);
    } else if (screen === 'l2') {
      setScreen('l1');
      setSelectedL1(null);
    }
  }, [screen]);

  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BrandScopePortal>
          <BaseDialog.Backdrop className={styles.drawerBackdrop} />
          <BaseDialog.Popup className={styles.drawer}>
            {/* Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderStart}>
                {screen !== 'l1' && (
                  <IconButton
                    icon="arrowLeft"
                    aria-label="Back to previous menu"
                    attention="low"
                    size={8}
                    condensed
                    onClick={handleBack}
                  />
                )}
                {logo}
              </div>
              <IconButton
                icon="close"
                aria-label="Close navigation menu"
                attention="low"
                size={8}
                condensed
                onClick={handleClose}
              />
            </div>

            {/* Drill-down body */}
            <div className={styles.drawerBody}>
              {/* Level 1 */}
              <div
                className={styles.drawerScreen}
                data-position={getScreenPosition(screen, 'l1')}
                role="menu"
                aria-label="Main navigation"
              >
                {navigation.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.drawerItem}
                    onClick={() => handleL1Click(item)}
                    role="menuitem"
                    style={{
                      transitionDelay: `${index * 40}ms`,
                    }}
                  >
                    <span>{item.label}</span>
                    {item.children && item.children.length > 0 && (
                      <span className={styles.drawerItemEnd} aria-hidden="true">
                        <Icon icon="chevronRight" size="4" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Level 2 */}
              <div
                className={styles.drawerScreen}
                data-position={getScreenPosition(screen, 'l2')}
                role="menu"
                aria-label={selectedL1?.label ?? 'Submenu'}
              >
                {selectedL1?.children?.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.drawerItem}
                    onClick={() => handleL2Click(item)}
                    role="menuitem"
                    style={{
                      transitionDelay: `${index * 40}ms`,
                    }}
                  >
                    <span>{item.label}</span>
                    {item.children && item.children.length > 0 && (
                      <span className={styles.drawerItemEnd} aria-hidden="true">
                        <Icon icon="chevronRight" size="4" />
                      </span>
                    )}
                    {item.locked && (
                      <span className={styles.drawerItemEnd} aria-label="Locked">
                        <Icon icon="lock" size="4" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Level 3 */}
              <div
                className={styles.drawerScreen}
                data-position={getScreenPosition(screen, 'l3')}
                role="menu"
                aria-label={selectedL2?.label ?? 'Sub-submenu'}
              >
                {selectedL2?.children?.map((item, index) => (
                  <a
                    key={item.key ?? item.href}
                    href={item.href}
                    className={styles.drawerItem}
                    onClick={handleClose}
                    role="menuitem"
                    style={{
                      transitionDelay: `${index * 40}ms`,
                    }}
                  >
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </BaseDialog.Popup>
        </BrandScopePortal>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
};
