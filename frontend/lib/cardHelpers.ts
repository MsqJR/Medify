export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '')
}

export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function formatCvc(value: string): string {
  return digitsOnly(value).slice(0, 4)
}

export type CardForm = {
  holder: string
  number: string
  expiry: string
  cvc: string
}

export function isValidCard(card: CardForm): boolean {
  const numberLength = digitsOnly(card.number).length
  const cvcLength = digitsOnly(card.cvc).length
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(card.expiry)
  if (!expiryMatch) return false
  const month = Number(expiryMatch[1])

  return (
    card.holder.trim().length >= 2 &&
    numberLength >= 13 &&
    numberLength <= 19 &&
    cvcLength >= 3 &&
    cvcLength <= 4 &&
    month >= 1 &&
    month <= 12
  )
}

export function validateCardForm(card: {
  cardholderName: string
  cardNumber: string
  expiry: string
  cvc: string
}): boolean {
  const cardNumberDigits = digitsOnly(card.cardNumber)
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(card.expiry.trim())
  const month = expiryMatch ? Number(expiryMatch[1]) : 0
  const year2 = expiryMatch ? Number(expiryMatch[2]) : -1
  const isExpiryValid = Boolean(expiryMatch) && month >= 1 && month <= 12 && year2 >= 0
  const isCardNumberValid = cardNumberDigits.length >= 13 && cardNumberDigits.length <= 19
  const isCvcValid = digitsOnly(card.cvc).length >= 3 && digitsOnly(card.cvc).length <= 4
  const isNameValid = card.cardholderName.trim().length >= 2

  return isNameValid && isCardNumberValid && isExpiryValid && isCvcValid
}
