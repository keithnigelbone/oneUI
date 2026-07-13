/**
 * SliderActiveTrack
 * Private Slider subcomponent — renders Base UI Slider.Indicator.
 * Not exported from @oneui/ui.
 */

import React from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import styles from './SliderActiveTrack.module.css';

export const SliderActiveTrack: React.FC = () => {
  return <BaseSlider.Indicator className={styles.indicator} />;
};
