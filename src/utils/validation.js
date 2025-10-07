// Validation utility functions for form inputs

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required' }
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' }
  }

  if (email.length > 254) {
    return { isValid: false, message: 'Email is too long (maximum 254 characters)' }
  }

  return { isValid: true, message: '' }
}

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'Phone number is required' }
  }

  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Check if phone contains only digits and is reasonable length
  if (cleanPhone.length < 10) {
    return { isValid: false, message: 'Phone number must be at least 10 digits' }
  }

  if (cleanPhone.length > 15) {
    return { isValid: false, message: 'Phone number is too long (maximum 15 digits)' }
  }

  // Check for valid phone patterns (international format)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter a valid phone number' }
  }

  return { isValid: true, message: '' }
}

/**
 * Validates name format (no special characters or numbers)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Name of the field (e.g., 'First Name', 'Last Name')
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` }
  }

  const trimmedName = name.trim()

  // Check for minimum length
  if (trimmedName.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` }
  }

  // Check for maximum length
  if (trimmedName.length > 50) {
    return { isValid: false, message: `${fieldName} is too long (maximum 50 characters)` }
  }

  // Check for special characters and numbers
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/
  
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` }
  }

  // Check for consecutive special characters
  if (/(\s{2,}|-{2,}|'{2,})/.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} cannot have consecutive spaces, hyphens, or apostrophes` }
  }

  // Check if name starts or ends with special characters
  if (/^[\s\-']|[\s\-']$/.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} cannot start or end with spaces, hyphens, or apostrophes` }
  }

  return { isValid: true, message: '' }
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password === '') {
    return { isValid: false, message: 'Password is required' }
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password is too long (maximum 128 characters)' }
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' }
  }

  return { isValid: true, message: '' }
}

/**
 * Validates password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword === '') {
    return { isValid: false, message: 'Please confirm your password' }
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' }
  }

  return { isValid: true, message: '' }
}

/**
 * Formats phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone // Return original if doesn't match common patterns
}

/**
 * Formats name for display (capitalizes first letter of each word)
 * @param {string} name - Name to format
 * @returns {string} - Formatted name
 */
export const formatName = (name) => {
  if (!name) return ''
  
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Real-time validation helper for input fields
 * @param {string} value - Input value
 * @param {string} type - Validation type ('email', 'phone', 'name', 'password')
 * @param {string} fieldName - Field name for name validation
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateField = (value, type, fieldName = 'Name') => {
  switch (type) {
    case 'email':
      return validateEmail(value)
    case 'phone':
      return validatePhone(value)
    case 'name':
      return validateName(value, fieldName)
    case 'password':
      return validatePassword(value)
    default:
      return { isValid: true, message: '' }
  }
}

