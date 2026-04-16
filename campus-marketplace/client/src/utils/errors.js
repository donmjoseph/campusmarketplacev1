export function getErrorMessage(error, fallback = 'Something went wrong.') {
  return (
    error?.response?.data?.details?.[0]?.msg
    || error?.response?.data?.message
    || error?.message
    || fallback
  )
}
