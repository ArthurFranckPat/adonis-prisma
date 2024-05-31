export function omit<M extends object, K extends keyof M>(obj: M, keys: K[]): Omit<M, K> {
  const duplicate = { ...obj }

  for (const key of keys) {
    delete duplicate[key]
  }
  return duplicate
}
