import { Dimensions } from 'react-native';
import { DeviceType } from '../redux/state/modeSlice';

export const getDeviceType = (): DeviceType => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = width / height;
  const minDimension = Math.min(width, height);
  
  // Consider tablets as devices with min dimension >= 600dp
  // This covers most 7"+ tablets in both orientations
  if (minDimension >= 600) {
    return 'tablet';
  }
  
  return 'mobile';
};

export const isLandscape = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

export const getResponsiveValue = <T>(mobileValue: T, tabletValue: T, deviceType: DeviceType): T => {
  return deviceType === 'tablet' ? tabletValue : mobileValue;
};

export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};