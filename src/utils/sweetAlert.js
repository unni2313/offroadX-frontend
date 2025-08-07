import Swal from 'sweetalert2'

// Custom SweetAlert configurations for OffroadX theme
export const showSuccess = (title, text, timer = 2000) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#059669',
    background: '#1f2937',
    color: '#f3f4f6',
    timer: timer,
    showConfirmButton: timer ? false : true,
    customClass: {
      popup: 'border border-gray-600',
      title: 'text-green-400',
      content: 'text-gray-300'
    }
  })
}

export const showError = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#059669',
    background: '#1f2937',
    color: '#f3f4f6',
    customClass: {
      popup: 'border border-gray-600',
      title: 'text-red-400',
      content: 'text-gray-300'
    }
  })
}

export const showWarning = (title, text) => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonColor: '#059669',
    background: '#1f2937',
    color: '#f3f4f6',
    customClass: {
      popup: 'border border-gray-600',
      title: 'text-yellow-400',
      content: 'text-gray-300'
    }
  })
}

export const showInfo = (title, text) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonColor: '#059669',
    background: '#1f2937',
    color: '#f3f4f6',
    customClass: {
      popup: 'border border-gray-600',
      title: 'text-blue-400',
      content: 'text-gray-300'
    }
  })
}

export const showConfirm = (title, text, confirmText = 'Yes', cancelText = 'No') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#059669',
    cancelButtonColor: '#dc2626',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: '#1f2937',
    color: '#f3f4f6',
    customClass: {
      popup: 'border border-gray-600',
      title: 'text-gray-100',
      content: 'text-gray-300'
    }
  })
}

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm
}
