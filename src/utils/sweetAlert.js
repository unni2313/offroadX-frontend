import Swal from 'sweetalert2'

// Custom SweetAlert configurations for OffroadX 2025 theme
export const showSuccess = (title, text, timer = 2000) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#ea580c',
    background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
    color: '#f5f5f4',
    timer: timer,
    showConfirmButton: timer ? false : true,
    backdrop: 'rgba(0, 0, 0, 0.8)',
    customClass: {
      popup: 'border border-stone-700/50 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl',
      title: 'text-green-400 font-black text-2xl tracking-wide drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]',
      content: 'text-stone-300 font-light text-lg leading-relaxed',
      confirmButton: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.6)] transform hover:scale-105 transition-all duration-300 border-0'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      popup.style.borderImage = 'linear-gradient(135deg, rgba(234,88,12,0.3), rgba(251,146,60,0.2), rgba(234,88,12,0.3)) 1';
    }
  })
}

export const showError = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#ea580c',
    background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
    color: '#f5f5f4',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    customClass: {
      popup: 'border border-stone-700/50 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl',
      title: 'text-red-400 font-black text-2xl tracking-wide drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]',
      content: 'text-stone-300 font-light text-lg leading-relaxed',
      confirmButton: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.6)] transform hover:scale-105 transition-all duration-300 border-0'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      popup.style.borderImage = 'linear-gradient(135deg, rgba(248,113,113,0.3), rgba(252,165,165,0.2), rgba(248,113,113,0.3)) 1';
    }
  })
}

export const showWarning = (title, text) => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonColor: '#ea580c',
    background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
    color: '#f5f5f4',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    customClass: {
      popup: 'border border-stone-700/50 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl',
      title: 'text-amber-400 font-black text-2xl tracking-wide drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]',
      content: 'text-stone-300 font-light text-lg leading-relaxed',
      confirmButton: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.6)] transform hover:scale-105 transition-all duration-300 border-0'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      popup.style.borderImage = 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(252,211,77,0.2), rgba(251,191,36,0.3)) 1';
    }
  })
}

export const showInfo = (title, text) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonColor: '#ea580c',
    background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
    color: '#f5f5f4',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    customClass: {
      popup: 'border border-stone-700/50 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl',
      title: 'text-blue-400 font-black text-2xl tracking-wide drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]',
      content: 'text-stone-300 font-light text-lg leading-relaxed',
      confirmButton: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.6)] transform hover:scale-105 transition-all duration-300 border-0'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      popup.style.borderImage = 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(147,197,253,0.2), rgba(96,165,250,0.3)) 1';
    }
  })
}

export const showConfirm = (title, text, confirmText = 'Yes', cancelText = 'No') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ea580c',
    cancelButtonColor: '#57534e',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
    color: '#f5f5f4',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    customClass: {
      popup: 'border border-stone-700/50 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl',
      title: 'text-stone-100 font-black text-2xl tracking-wide drop-shadow-[0_0_15px_rgba(245,245,244,0.3)]',
      content: 'text-stone-300 font-light text-lg leading-relaxed',
      confirmButton: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.6)] transform hover:scale-105 transition-all duration-300 border-0 mr-3',
      cancelButton: 'bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-500 hover:to-stone-600 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_8px_30px_rgba(87,83,78,0.4)] hover:shadow-[0_12px_40px_rgba(87,83,78,0.6)] transform hover:scale-105 transition-all duration-300 border-0'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      popup.style.borderImage = 'linear-gradient(135deg, rgba(234,88,12,0.3), rgba(251,146,60,0.2), rgba(234,88,12,0.3)) 1';
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
