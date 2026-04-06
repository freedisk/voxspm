'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
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
    <div className="flex flex-col gap-3">
      {/* Radio buttons custom — pas les natifs pour garder le design cohérent */}
      <fieldset>
        <legend className="sr-only">Choisissez une option</legend>
        <div className="flex flex-col gap-2">
          {options
            .sort((a, b) => a.order_index - b.order_index)
            .map((option) => {
              const isSelected = selectedOptionId === option.id
              return (
                <label
                  key={option.id}
                  className={`
                    flex items-center gap-3 min-h-[44px] px-4 py-3
                    rounded-xl cursor-pointer border transition-colors
                    ${isSelected
                      ? 'bg-ocean/10 border-ocean text-foreground'
                      : 'bg-surface-2 border-rock/20 text-muted hover:border-ocean/30'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`vote-${pollId}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedOptionId(option.id)}
                    className="sr-only"
                  />
                  {/* Indicateur visuel radio */}
                  <span
                    className={`
                      w-4 h-4 shrink-0 rounded-full border-2 transition-colors
                      flex items-center justify-center
                      ${isSelected ? 'border-ocean' : 'border-rock'}
                    `}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-ocean" />
                    )}
                  </span>
                  <span className="text-sm">{option.text}</span>
                </label>
              )
            })}
        </div>
      </fieldset>

      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        isLoading={isSubmitting}
        disabled={!selectedOptionId}
      >
        Voter
      </Button>
    </div>
  )
}
