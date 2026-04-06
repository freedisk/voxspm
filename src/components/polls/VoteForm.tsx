'use client'

import { useState } from 'react'
import { vote } from '@/lib/actions/polls'

interface Option {
  id: string
  text: string
  order_index: number
}

interface VoteFormProps {
  pollId: string
  options: Option[]
  onVoteSuccess: () => void
  onLocationRequired: () => void
}

export default function VoteForm({
  pollId,
  options,
  onVoteSuccess,
  onLocationRequired,
}: VoteFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selectedOptionId) return
    setIsSubmitting(true)
    setError(null)

    const result = await vote(pollId, selectedOptionId)

    if (result.success) {
      onVoteSuccess()
    } else {
      if (result.code === 'LOCATION_REQUIRED') {
        onLocationRequired()
      } else {
        setError(result.error)
      }
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className="sr-only">Choisissez une option</legend>
        <div className="flex flex-col gap-2.5">
          {options
            .sort((a, b) => a.order_index - b.order_index)
            .map((option) => {
              const isSelected = selectedOptionId === option.id
              return (
                <label
                  key={option.id}
                  className="
                    flex items-center gap-3 min-h-[44px] px-4 py-3.5
                    rounded-[var(--radius-sm)] cursor-pointer
                    transition-all duration-200
                  "
                  // 🎨 Intent: border 1.5px, hover → border ocean + fond ocean-glow
                  style={{
                    border: `1.5px solid ${isSelected ? 'var(--ocean)' : 'var(--border-strong)'}`,
                    background: isSelected ? 'var(--ocean-glow)' : 'var(--white)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--ocean)'
                      e.currentTarget.style.background = 'var(--ocean-glow)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-strong)'
                      e.currentTarget.style.background = 'var(--white)'
                    }
                  }}
                >
                  <input
                    type="radio"
                    name={`vote-${pollId}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedOptionId(option.id)}
                    className="sr-only"
                  />
                  {/* 🎨 Intent: radio custom 18px, selected → fond ocean + inset shadow blanc */}
                  <span
                    className="w-[18px] h-[18px] shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: isSelected ? 'var(--ocean)' : 'var(--border-strong)',
                      background: isSelected ? 'var(--ocean)' : 'transparent',
                      boxShadow: isSelected ? 'inset 0 0 0 3px var(--white)' : 'none',
                    }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {option.text}
                  </span>
                </label>
              )
            })}
        </div>
      </fieldset>

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
      )}

      {/* 🎨 Intent: bouton Voter — fond ocean, shadow bleu, micro lift */}
      <button
        onClick={handleSubmit}
        disabled={!selectedOptionId || isSubmitting}
        className="
          min-h-[44px] px-6 py-3 rounded-[var(--radius-sm)]
          text-sm font-medium text-white
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:enabled:-translate-y-[1px]
        "
        style={{
          background: 'var(--ocean)',
          boxShadow: '0 4px 16px rgba(26,111,181,0.25)',
        }}
      >
        {isSubmitting ? 'Vote en cours...' : 'Voter'}
      </button>
    </div>
  )
}
