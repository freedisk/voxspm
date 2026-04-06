'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { proposePoll } from '@/lib/actions/polls'
import { createClient } from '@/lib/supabase/client'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

const proposePollSchema = z.object({
  question: z.string().min(10, 'La question doit faire au moins 10 caractères').max(300, 'Maximum 300 caractères'),
  options: z
    .array(z.string().min(1, 'Option vide'))
    .min(2, 'Il faut au moins 2 options')
    .max(6, 'Maximum 6 options'),
})

export default function ProposerPage() {
  const [question, setQuestion] = useState('')
  const [proposerName, setProposerName] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchTags() {
      const supabase = createClient()
      const { data } = await supabase
        .from('tags')
        .select('*')
        .order('order_index')
      setAllTags(data ?? [])
    }
    fetchTags()
  }, [])

  function addOption() {
    if (options.length >= 6) return
    setOptions([...options, ''])
  }

  function removeOption(index: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }

  function updateOption(index: number, value: string) {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId)
      }
      if (prev.length >= 3) return prev
      return [...prev, tagId]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation Zod côté client avant d'appeler le Server Action
    const parsed = proposePollSchema.safeParse({ question, options })
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    setIsSubmitting(true)

    const result = await proposePoll({
      question,
      proposerName: proposerName || undefined,
      options,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    })

    if (result.success) {
      setSuccess(true)
      setQuestion('')
      setProposerName('')
      setOptions(['', ''])
      setSelectedTagIds([])
    } else {
      setError(result.error)
    }

    setIsSubmitting(false)
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-2">🗳️</p>
        <h1 className="text-xl font-bold text-foreground mb-2">Merci !</h1>
        <p className="text-muted text-sm">
          Votre proposition sera examinée sous 48h.
        </p>
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => setSuccess(false)}
        >
          Proposer un autre sondage
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-6">
        Proposer un sondage
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Question */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="question" className="text-sm font-medium text-muted">
            Question <span className="text-danger">*</span>
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Faut-il développer le transport maritime inter-îles ?"
            maxLength={300}
            rows={3}
            className="
              w-full px-4 py-3 rounded-xl bg-surface-1 border border-rock/20
              text-foreground placeholder:text-muted/50 text-sm
              focus:outline-none focus:border-ocean resize-none
            "
          />
          <span className="text-xs text-muted text-right tabular-nums">
            {question.length}/300
          </span>
        </div>

        {/* Nom proposant */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="proposerName" className="text-sm font-medium text-muted">
            Votre nom ou pseudonyme
          </label>
          <input
            id="proposerName"
            type="text"
            value={proposerName}
            onChange={(e) => setProposerName(e.target.value)}
            placeholder="Anonyme"
            maxLength={50}
            className="
              w-full px-4 py-3 rounded-xl bg-surface-1 border border-rock/20
              text-foreground placeholder:text-muted/50 text-sm
              focus:outline-none focus:border-ocean min-h-[44px]
            "
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">
            Thèmes (max 3)
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`
                    min-h-[44px] px-3 py-1.5 rounded-full text-sm border transition-colors
                    ${isSelected
                      ? 'text-white border-transparent'
                      : 'bg-surface-2 text-muted border-rock/20 hover:border-ocean/40'
                    }
                  `}
                  style={isSelected ? { backgroundColor: tag.color } : undefined}
                >
                  <Badge label={tag.name} color={isSelected ? '#fff' : tag.color} icon={tag.icon} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">
            Options de réponse <span className="text-danger">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                  className="
                    flex-1 px-4 py-3 rounded-xl bg-surface-1 border border-rock/20
                    text-foreground placeholder:text-muted/50 text-sm
                    focus:outline-none focus:border-ocean min-h-[44px]
                  "
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="
                      min-h-[44px] min-w-[44px] flex items-center justify-center
                      text-muted hover:text-danger rounded-lg hover:bg-surface-2
                      transition-colors
                    "
                    aria-label={`Supprimer l'option ${index + 1}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="
                self-start mt-1 text-sm text-ocean hover:text-ocean-light
                transition-colors
              "
            >
              + Ajouter une option
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          Envoyer ma proposition
        </Button>
      </form>
    </div>
  )
}
