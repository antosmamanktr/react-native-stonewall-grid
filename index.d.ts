import { ReactElement } from 'react';

export interface StonewallGridProps<T = any> {
  data: T[];
  renderItem: (info: { item: T }) => ReactElement;
  columns?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  preserveOrder?: boolean;
  imageFields?: (keyof T)[];
}

declare function StonewallGrid<T = any>(props: StonewallGridProps<T>): ReactElement;

export default StonewallGrid;
export type { StonewallGridProps };
