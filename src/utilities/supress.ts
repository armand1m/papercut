export const supress = async <T>(
  fn: () => T | Promise<T>,
  onError?: (err: any) => void
) => {
  try {
    return await fn();
  } catch (err) {
    if (onError) {
      onError(err);
    }
    return undefined;
  }
};
