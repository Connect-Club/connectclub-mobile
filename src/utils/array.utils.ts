const noopCompact = <T, U>(value: T): U | undefined | null => {
  // @ts-ignore
  return value as U
}

export const getArrayOf = (length: number = 5): Array<number> =>
  Array.from({length}, (_v, i) => i)

export const toggleItemInSet = <T>(item: T, set: Set<T>) => {
  if (set.has(item)) {
    set.delete(item)
    return new Set(set)
  }
  return new Set(set.add(item))
}

export const addItemInSet = <T>(item: T, set: Set<T>): boolean => {
  if (set.has(item)) return false
  set.add(item)
  return true
}

export const compactMap = <T, U>(
  original: Array<T>,
  fn: (value: T) => U | undefined | null = noopCompact,
): Array<U> => {
  const newArray: Array<U> = []
  for (const t of original) {
    const newValue = fn(t)
    if (newValue) newArray.push(newValue)
  }
  return newArray
}

export const associateBy = <TKey extends string | number, TValue>(
  original: Array<TValue>,
  keyProvider: (item: TValue) => TKey,
): {[key in TKey]: TValue} => {
  // @ts-ignore
  const result: {[key in TKey]: TValue} = {}
  original.forEach((item) => {
    result[keyProvider(item)] = item
  })
  return result
}
