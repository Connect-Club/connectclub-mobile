export default class BreakException<V> extends Error {
  constructor(public value: V) {
    super()
  }
}
