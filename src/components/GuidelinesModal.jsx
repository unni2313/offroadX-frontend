import React, { useEffect, useMemo, useState } from 'react'
import { FaFlag, FaSave, FaTimes, FaTrash } from 'react-icons/fa'
import { showError, showSuccess, showWarning } from '../utils/sweetAlert'
import GuidelinesPreview from './GuidelinesPreview'

const REQUIRED_ICON_CLASSES = 'text-red-400 text-xs font-bold uppercase tracking-wider'
const OPTIONAL_ICON_CLASSES = 'text-slate-400 text-xs uppercase tracking-wider'

const defaultChecklistItems = (items = []) => {
  if (items.length > 0) {
    return items.map((item) => ({
      item: item.item || '',
      required: Boolean(item.required)
    }))
  }

  return [
    { item: "Valid driver's license", required: true },
    { item: 'Safety helmet', required: true },
    { item: 'Vehicle inspection completed', required: true },
    { item: 'Emergency contact provided', required: true },
    { item: 'Medical clearance (if needed)', required: false }
  ]
}

function ChecklistRow({ index, item, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-4 items-start">
      <div className="col-span-12 md:col-span-7">
        <label className="text-xs font-semibold text-slate-400 mb-2 block">Checklist Item</label>
        <input
          type="text"
          value={item.item}
          onChange={(event) => onChange(index, { ...item, item: event.target.value })}
          placeholder="Describe the requirement"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
        />
      </div>

      <div className="col-span-12 md:col-span-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-400 mb-2 block">Required?</label>
          <button
            type="button"
            onClick={() => onChange(index, { ...item, required: !item.required })}
            className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition border ${
              item.required
                ? 'bg-red-500/20 text-red-300 border-red-400/40 hover:bg-red-500/30'
                : 'bg-slate-800/60 text-slate-300 border-slate-600 hover:bg-slate-700'
            }`}
          >
            {item.required ? 'Required' : 'Optional'}
          </button>
        </div>

        <div className="flex flex-col justify-end">
          <label className="text-xs font-semibold text-slate-400 mb-2 block md:hidden" htmlFor={`remove-guideline-${index}`}>
            Actions
          </label>
          <button
            id={`remove-guideline-${index}`}
            type="button"
            onClick={() => onRemove(index)}
            className="w-full md:w-auto mt-3 md:mt-0 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/40 rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition"
          >
            <FaTrash />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GuidelinesModal({ isOpen, event, onClose, onSave, loading = false }) {
  const [guidelineText, setGuidelineText] = useState('')
  const [checklistItems, setChecklistItems] = useState(() => defaultChecklistItems())
  const [isDirty, setIsDirty] = useState(false)

  const title = useMemo(() => {
    const name = event?.name?.trim()
    return name ? `Guidelines for ${name}` : 'Event Guidelines'
  }, [event?.name])

  useEffect(() => {
    if (!event || !isOpen) return

    const items = defaultChecklistItems(event.guidelines?.checklistItems)
    setGuidelineText(event.guidelines?.text || '')
    setChecklistItems(items)
    setIsDirty(false)
  }, [event, isOpen])

  const handleClose = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) {
      return
    }
    onClose()
  }

  const handleChecklistChange = (index, updatedItem) => {
    setChecklistItems((prevItems) => {
      const nextItems = [...prevItems]
      nextItems[index] = updatedItem
      return nextItems
    })
    setIsDirty(true)
  }

  const handleChecklistRemove = (index) => {
    setChecklistItems((prevItems) => {
      if (prevItems.length === 1) {
        showWarning('Cannot Remove Item', 'At least one checklist item is required.')
        return prevItems
      }
      const nextItems = prevItems.filter((_, idx) => idx !== index)
      return nextItems
    })
    setIsDirty(true)
  }

  const handleAddChecklistItem = () => {
    setChecklistItems((prevItems) => [
      ...prevItems,
      { item: 'New guideline item', required: false }
    ])
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!event?._id) {
      showError('Cannot Save', 'Invalid event identifier.')
      return
    }

    const trimmedText = guidelineText.trim()
    const sanitizedChecklist = checklistItems
      .map((item) => ({ item: item.item.trim(), required: !!item.required }))
      .filter((item) => item.item.length > 0)

    if (trimmedText.length === 0) {
      showWarning('Guidelines Required', 'Please provide guideline instructions for participants.')
      return
    }

    if (sanitizedChecklist.length === 0) {
      showWarning('Checklist Required', 'Please add at least one checklist item.')
      return
    }

    const hasRequired = sanitizedChecklist.some((item) => item.required)
    if (!hasRequired) {
      const confirmOptionalOnly = await showWarning(
        'No Required Items',
        'You have not marked any checklist items as required. Participants could complete guidelines without acknowledgment. Do you want to proceed?'
      )
      if (!confirmOptionalOnly?.isConfirmed) {
        return
      }
    }

    try {
      await onSave(event._id, {
        text: trimmedText,
        checklistItems: sanitizedChecklist
      })
      setIsDirty(false)
      showSuccess('Guidelines Saved', 'Event guidelines have been updated successfully.')
      onClose()
    } catch (error) {
      const message = error?.message || 'Failed to save guidelines. Please try again.'
      showError('Error Saving Guidelines', message)
    }
  }

  if (!isOpen || !event) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-5 md:px-8 md:py-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
              <FaFlag className="text-indigo-300 text-xl" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2>
              <p className="text-xs text-slate-400 md:text-sm">Configure safety instructions and checklist requirements for participants.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition"
          >
            <FaTimes className="text-lg md:text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-6">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-8">
            <div className="space-y-6">
              <section>
                <header className="flex flex-col gap-1 mb-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-white md:text-lg">Guideline Instructions</h3>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider md:text-xs">Visible to participants</span>
                </header>
                <textarea
                  value={guidelineText}
                  onChange={(event) => {
                    setGuidelineText(event.target.value)
                    setIsDirty(true)
                  }}
                  rows={8}
                  placeholder="Provide detailed safety instructions, pre-race requirements, and timing expectations..."
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-4 text-sm text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition min-h-[180px]"
                />
              </section>

              <section>
                <header className="flex flex-col gap-1 mb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white md:text-lg">Checklist Requirements</h3>
                    <p className="text-xs text-slate-400">Participants must acknowledge each item before they can join the event.</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider md:text-xs">Admin Only</span>
                </header>

                <div className="space-y-6">
                  {checklistItems.map((item, index) => (
                    <ChecklistRow
                      key={`guideline-item-${index}`}
                      index={index}
                      item={item}
                      onChange={handleChecklistChange}
                      onRemove={handleChecklistRemove}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="w-full px-4 py-3 rounded-xl border border-dashed border-slate-600 text-slate-300 hover:border-orange-500/60 hover:text-orange-300 hover:bg-orange-500/10 transition text-sm font-semibold"
                  >
                    + Add Checklist Item
                  </button>
                </div>
              </section>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-3xl px-5 py-5 space-y-6 md:px-6 md:py-6">
              <GuidelinesPreview text={guidelineText} checklist={checklistItems} />

              <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 px-5 py-4 space-y-2">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Checklist Summary</h4>
                <p className="text-xs text-slate-400">Required items block registration until completed.</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center justify-between">
                    <span className="font-medium">Total Items</span>
                    <span>{checklistItems.length}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="font-medium">Required Items</span>
                    <span>{checklistItems.filter((item) => item.required).length}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="font-medium">Optional Items</span>
                    <span>{checklistItems.filter((item) => !item.required).length}</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-orange-500/10 border border-orange-500/40 px-5 py-4 space-y-3">
                <h4 className="text-sm font-semibold text-orange-200 flex items-center gap-2">
                  <FaFlag /> Verification Policy
                </h4>
                <p className="text-xs text-orange-100/80 leading-relaxed">
                  Required checklist items must be acknowledged by participants and verified by admins before race day. Optional items are recommended best practices.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className={REQUIRED_ICON_CLASSES}>Required Acknowledgement</span>
                  <span className={OPTIONAL_ICON_CLASSES}>Optional Guidance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-5 md:px-8 md:py-6 border-t border-slate-700/50 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 md:text-xs text-center md:text-left">
            Changes are saved instantly for all participants once you click save.
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800/70 hover:bg-slate-700 border border-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border border-orange-400/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaSave className="text-base md:text-lg" />
              {loading ? 'Saving...' : 'Save Guidelines'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}