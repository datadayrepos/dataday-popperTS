export default function debounce<T>(
  fn: (...args: any[]) => T, // Ensure fn returns a T
): () => Promise<T> {
  let pending: Promise<T> | undefined
  return function (this: any, ...args: any[]): Promise<T> { // Ensure the returned function is properly typed
    if (!pending) {
      pending = new Promise<T>((resolve) => { // Create a new Promise<T>
        Promise.resolve().then(() => {
          pending = undefined
          resolve(fn.apply(this, args)) // Call fn with correct 'this' context and arguments, resolve with its return value
        })
      })
    }

    return pending
  }
}
