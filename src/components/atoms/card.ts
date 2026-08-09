import {
  createRestyleComponent,
  createVariant,
  type VariantProps,
} from '@shopify/restyle';
import type React from 'react';
import type { Theme } from '@/lib/theme';
import Box from './box';

const Card = createRestyleComponent<
  VariantProps<Theme, 'cardVariants'> & React.ComponentProps<typeof Box>,
  Theme
>([createVariant({ themeKey: 'cardVariants' })], Box);

export default Card;
