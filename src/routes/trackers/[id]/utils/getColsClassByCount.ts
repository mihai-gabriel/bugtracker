import type { CssClasses } from '@skeletonlabs/skeleton';

export const getColsClassByCount = (gridCount: number): CssClasses => {
  // Note: It does not render properly if you compute it
  // like this: `grid-cols-${statusInput.length || 3}`  ¯\_(ツ)_/¯
  switch (gridCount) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-2';
    case 0:
    case 3:
    default:
      return 'grid-cols-3';
  }
};
