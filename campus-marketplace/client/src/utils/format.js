import dayjs from 'dayjs'

export function currency(value = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0))
}

export function friendlyDate(value) {
  if (!value) return 'N/A'
  return dayjs(value).format('MMM D, YYYY h:mm A')
}

export function statusBadgeClass(status) {
  switch (status) {
    case 'active':
      return 'cm-badge cm-badge--active'
    case 'inactive':
      return 'cm-badge cm-badge--inactive'
    case 'draft':
      return 'cm-badge cm-badge--draft'
    case 'sold':
      return 'cm-badge cm-badge--fulfilled'
    case 'removed':
      return 'cm-badge cm-badge--removed'
    case 'pending':
      return 'cm-badge cm-badge--pending'
    case 'fulfilled':
      return 'cm-badge cm-badge--fulfilled'
    case 'cancelled':
      return 'cm-badge cm-badge--cancelled'
    case 'cancellation_requested':
      return 'cm-badge cm-badge--cancel-req'
    case 'suspended':
      return 'cm-badge cm-badge--suspended'
    default:
      return 'cm-badge'
  }
}

export function titleCase(value = '') {
  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}
