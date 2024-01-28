import { useMemo } from 'react';

interface List {
  title: string;
  updatedAt: Date;
  amount: number;
  amountChecked: number;
}

const sortDefault = (a: List, b: List) => {
  return a.title > b.title ? 1 : -1;
};

const sortAlphabetically = (a: List, b: List) => {
  return sortDefault(a, b);
};

const sortAlphabeticallyReverse = (a: List, b: List) => {
  return sortDefault(b, a);
};

const sortLastUpdated = (a: List, b: List) => {
  return a.updatedAt < b.updatedAt ? 1 : -1;
};

const sortLastUpdatedReverse = (a: List, b: List) => {
  return sortLastUpdated(b, a);
};

const sortAmount = (a: List, b: List) => {
  return a.amount < b.amount ? 1 : -1;
};

const sortAmountReverse = (a: List, b: List) => {
  return sortAmount(b, a);
};

const sortAmountChecked = (a: List, b: List) => {
  return a.amountChecked < b.amountChecked ? 1 : -1;
};

const sortAmountCheckedReverse = (a: List, b: List) => {
  return sortAmountChecked(b, a);
};

export const sortMap = {
  default: sortDefault,
  alphabetically: sortAlphabetically,
  alphabeticallyReverse: sortAlphabeticallyReverse,
  lastUpdated: sortLastUpdated,
  lastUpdatedReverse: sortLastUpdatedReverse,
  amount: sortAmount,
  amountReverse: sortAmountReverse,
  amountChecked: sortAmountChecked,
  amountCheckedReverse: sortAmountCheckedReverse,
};

export const useSortedLists = <TListArray extends List[]>(
  lists: TListArray | undefined,
  sort: keyof typeof sortMap = 'default',
) => {
  return useMemo(() => {
    if (!lists) return [];
    return lists.sort(sortMap[sort]);
  }, [lists, sort]);
};
