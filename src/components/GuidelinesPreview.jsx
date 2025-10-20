import React, { useMemo } from 'react'
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa'

const REQUIRED_ICON_CLASSES = 'text-orange-300'
const OPTIONAL_ICON_CLASSES = 'text-slate-400'

export default function GuidelinesPreview({ text = '', checklist = [] }) {
  const paragraphs = useMemo(() => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }, [text])

  const hasChecklistItems = checklist.length > 0

  return (
    <aside className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Participant Preview</p>
        <h3 className="text-xl font-bold text-white">Guideline Overview</h3>
        <p className="text-sm text-slate-400">
          What participants will read before confirming their event registration.
        </p>
      </header>

      <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p key={`guidelines-paragraph-${index}`} className="text-sm leading-relaxed text-slate-200">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500 italic">No guideline text provided yet.</p>
        )}
      </article>

      <section className="rounded-2xl border border-slate-800/50 bg-slate-900/50">
        <header className="border-b border-slate-800/60 px-5 py-4">
          <h4 className="text-sm font-semibold text-white">Checklist Items</h4>
          <p className="text-xs text-slate-400">
            Required items must be acknowledged to complete registration.
          </p>
        </header>

        <div className="px-5 py-4 space-y-3">
          {hasChecklistItems ? (
            checklist.map((item, index) => (
              <div key={`checklist-preview-${index}`} className="flex items-start gap-3">
                <div className="mt-1">
                  {item.required ? (
                    <FaCheckCircle className={REQUIRED_ICON_CLASSES} />
                  ) : (
                    <FaRegCircle className={OPTIONAL_ICON_CLASSES} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-white">{item.item || 'Unnamed checklist item'}</p>
                  <p className="text-xs text-slate-500">
                    {item.required ? 'Required acknowledgment' : 'Optional guidance'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No checklist items configured.</p>
          )}
        </div>
      </section>
    </aside>
  )
}