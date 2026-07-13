export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDataAllowance(gbPerDay: number): string {
  return gbPerDay >= 1 ? `${gbPerDay} GB/day` : `${gbPerDay * 1000} MB/day`
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function maskMobile(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 4) return digits
  return `${digits.slice(0, 2)}••••${digits.slice(-4)}`
}

export function isValidMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))
}
