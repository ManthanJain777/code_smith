import React from 'react';
import { GemStarLogo, GemStarLogoProps } from './GemStarLogo';

export type GemShieldLogoProps = GemStarLogoProps;

/**
 * GemShieldLogo alias — delegates directly to GemStarLogo (two-triangle Red, Green, Blue star).
 */
export const GemShieldLogo: React.FC<GemShieldLogoProps> = (props) => {
  return <GemStarLogo {...props} />;
};

export default GemShieldLogo;
