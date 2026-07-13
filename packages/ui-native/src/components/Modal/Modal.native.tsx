/**
 * Modal.native.tsx
 *
 * Native Modal implementation using react-native Modal.
 * Aligned with packages/ui/src/components/Modal/Modal.tsx.
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Modal as RNModal,
  View,
  ScrollView,
  Pressable,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { tokens } from '@oneui/tokens';
import {
  useModalState,
  getModalAccessibilityProps,
  type ModalProps,
  type DividerScrollPosition,
} from './interface';
import {
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
  useOneUITheme,
} from '../../theme';
import { styles, TITLE_STYLE, TITLE_CENTER_STYLE, POPUP_SIZE } from './Modal.styles.native';
import { IconButton } from '../IconButton/IconButton.native';
import { Divider } from '../Divider/Divider.native';
import { Text } from '../Text/Text.native';

const scrollPositionRank: Record<DividerScrollPosition, number> = {
  start: 0,
  middle: 1,
  end: 2,
};

export function Modal(props: ModalProps): React.ReactElement {
  const {
    open,
    defaultOpen,
    onOpenChange,
    dismissible = true,
    headerStart,
    title,
    description,
    children,
    footerStart,
    footerEnd,
    testID,
    style: styleProp,
  } = props;

  const {
    resolvedSize,
    showHeader,
    showTitle,
    showDescription,
    showFooter,
    dividerTopVisibility,
    dividerBottomVisibility,
    dividerTopScrollPosition,
    dividerBottomScrollPosition,
    footerOrientation,
    headerAlign,
  } = useModalState(props);

  const [isOpen, setIsOpen] = useState(open ?? defaultOpen ?? false);

  // Sync internal state with prop if controlled
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleRequestClose = useCallback(() => {
    if (!dismissible) return;
    if (onOpenChange) {
      onOpenChange(false, { reason: 'outside-press' });
    } else {
      setIsOpen(false);
    }
  }, [dismissible, onOpenChange]);

  const handleCloseButtonPress = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false, { reason: 'close-press' });
    } else {
      setIsOpen(false);
    }
  }, [onOpenChange]);

  const theme = useOneUITheme();
  // Modal uses Elevated surface role by default
  const elevatedRole = useSurfaceTokens('neutral').surfaces.elevated;
  const scrimColor = tokens.material.translucent.dark.moderate;

  const titleTypo = useTypographyTokens('title', 'M');
  const descriptionTypo = useTypographyTokens('body', 'S');

  const [scrollState, setScrollState] = useState<'start' | 'middle' | 'end' | 'fits'>('fits');

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollTop = contentOffset.y;
    const scrollHeight = contentSize.height;
    const clientHeight = layoutMeasurement.height;

    const hasOverflow = scrollHeight > clientHeight + 1;
    const atTop = scrollTop <= 1;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if (!hasOverflow) setScrollState('fits');
    else if (atTop) setScrollState('start');
    else if (atBottom) setScrollState('end');
    else setScrollState('middle');
  };

  const scrollRank =
    scrollState === 'fits' ? null : (scrollPositionRank[scrollState as DividerScrollPosition] ?? 1); // middle fallback

  const showTopDivider =
    dividerTopVisibility === 'always' ||
    (dividerTopVisibility === 'onScroll' &&
      scrollRank !== null &&
      scrollRank >= scrollPositionRank[dividerTopScrollPosition]);

  const showBottomDivider =
    dividerBottomVisibility === 'always' ||
    (dividerBottomVisibility === 'onScroll' &&
      scrollRank !== null &&
      scrollRank <= scrollPositionRank[dividerBottomScrollPosition]);

  const a11y = getModalAccessibilityProps(props, { showHeader, showTitle });

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
      testID={testID}
    >
      <View style={styles.centeredView}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: scrimColor }]}
          onPress={handleRequestClose}
        />
        <View
          {...a11y}
          style={[
            styles.popup,
            POPUP_SIZE[resolvedSize],
            {
              backgroundColor: elevatedRole,
              borderRadius: theme.shape['4'],
            },
            styleProp,
          ]}
        >
          {showHeader && (
            <View style={styles.header}>
              <View
                style={[
                  styles.headerContent,
                  headerAlign === 'center' && styles.headerContentCenter,
                ]}
              >
                {headerStart && <View style={styles.headerStartSlot}>{headerStart}</View>}
                <View
                  style={[styles.headerText, headerAlign === 'center' && styles.headerTextCenter]}
                >
                  {showTitle && title && (
                    <Text
                      style={StyleSheet.flatten([
                        typographyToTextStyle(titleTypo),
                        headerAlign === 'center' ? TITLE_CENTER_STYLE : TITLE_STYLE,
                      ])}
                    >
                      {title}
                    </Text>
                  )}
                  {showDescription && description && (
                    <Text
                      style={StyleSheet.flatten([
                        typographyToTextStyle(descriptionTypo),
                        headerAlign === 'center' ? TITLE_CENTER_STYLE : TITLE_STYLE,
                      ])}
                    >
                      {description}
                    </Text>
                  )}
                </View>
              </View>
              <IconButton
                icon="close"
                size="s"
                condensed={true}
                attention="low"
                appearance="neutral"
                aria-label="Close"
                onPress={handleCloseButtonPress}
              />
            </View>
          )}

          {showTopDivider && (
            <Divider orientation="horizontal" size="m" attention="low" roundCaps />
          )}

          <ScrollView
            style={styles.body}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(width, height) => {
              // Approximate initial fits/overflow state
              if (height <= 0) setScrollState('fits');
            }}
          >
            {children}
          </ScrollView>

          {showBottomDivider && (
            <Divider orientation="horizontal" size="m" attention="low" roundCaps />
          )}

          {showFooter && (
            <View
              style={[styles.footer, footerOrientation === 'vertical' && styles.footerVertical]}
            >
              {footerStart && (
                <View
                  style={[
                    styles.footerStart,
                    footerOrientation === 'vertical' && styles.footerStartVertical,
                  ]}
                >
                  {footerStart}
                </View>
              )}
              {footerEnd && (
                <View
                  style={[
                    styles.footerActions,
                    footerOrientation === 'vertical' && styles.footerActionsVertical,
                  ]}
                >
                  {footerEnd}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
}
