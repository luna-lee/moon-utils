declare type Recordable<T = any> = Record<string, T>;
declare type TreeFactoryItemType<T> = {
  id: string;
  pId: string;
  children?: TreeFactoryItemType<T>[];
  data: T;
  track?: string[];
  trigger?: string[];
  level?: number;
  [k: string]: any;
};
