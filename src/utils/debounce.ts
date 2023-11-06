export default function debounce<T>(
  fn: (...args: Array<any>) => any,
): () => Promise<T> {
  let pending
  return function () {
    if (!pending) {
      pending = new Promise((resolve) => {
        Promise.resolve().then(() => {
          pending = undefined
          resolve(fn())
        })
      })
    }

    return pending
  }
}
