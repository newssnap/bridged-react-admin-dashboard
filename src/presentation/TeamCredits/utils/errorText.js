/** The message to show for a failed response: the server's own text first, then a fallback. */
export const responseErrorText = (response, fallback) =>
  response?.errorObject?.userErrorText || response?.errorObject?.message || fallback;

/** The message to show for a thrown request error (RTK Query `unwrap()`). */
export const thrownErrorText = (error, fallback) =>
  error?.data?.errorObject?.userErrorText || error?.data?.message || fallback;
