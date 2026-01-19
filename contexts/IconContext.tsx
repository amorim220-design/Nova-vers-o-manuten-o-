
import React from 'react';
import { IconStyle } from '../types';

interface IconContextType {
  style: IconStyle;
}

export const IconContext = React.createContext<IconContextType>({ style: 'solid' });

export const IconProvider = IconContext.Provider;
