'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { updatePoll } from '@/lib/actions/admin'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface OptionData {
  id: string
  text: string
  order_index: number
  votes_count: number
}

interface PollData {
  id: string
  question: string
  description: string | null
  status: 'pending' | 'active' | 'archived'
  proposer_name: string | null
  expires_at: string | null
}

interface PollEditorProps {
  poll: PollData
  options: OptionData[]
  selectedTagIds: string[]
  allTags: Tag[]
}

export default function PollEditor({
  poll,
  options: initialOptions,
  selectedTagIds: initialTagIds,
  allTags,
}: PollEditorProps) {
  const router = useRouter()
  const [question, setQuestion] = useState(poll.question)
  const [proposerName, setProposerName] = useState(poll.proposer_name ?? '')
  const [status, setStatus] = useState(poll.status)
  const [expiresAt, setExpiresAt] = useState(poll.expires_at ?? '')
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds)
  const [options, setOptions] = useState(initialOptions.map((o) => ({ text: o.text, order_index: o.order_index })))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // On ne permet pas de modifier les options si le sondage a déjà des votes
  // car les compteurs seraient incohérents
  const hasVotes = initialOptions.some((o) => o.votes_count > 0)

  function toggleTag(tagId: string) {
    setTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  function addOption() {
    if (options.length >= 6) return
    setOptions([...options, { text: '', order_index: options.length }])
  }

  function removeOption(index: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index).map((o, i) => ({ ...o, order_index: i })))
  }

  function updateOptionText(index: number, text: string) {
    const updated = [...options]
    updated[index] = { ...updated[index], text }
    setOptions(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    const result = await updatePoll(poll.id, {
      question,
      proposer_name: proposerName || null,
      status,
      expires_at: expiresAt || null,
      tagIds,
      // Ne mettre à jour les options que si le sondage n'a pas encore de votes
      ...(!hasVotes ? { options } : {}),
    })

    if (result.success) {
      setSuccess(true)
      router.refresh()
    } else {
      setError(result.error)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Question */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="question" className="text-sm font-medium text-muted">Question</label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={300}
          className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean resize-none"
        />
      </div>

      {/* Proposant */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="proposerName" className="text-sm font-medium text-muted">Proposant</label>
        <input
          id="proposerName"
          type="text"
          value={proposerName}
          onChange={(e) => setProposerName(e.target.value)}
          placeholder="Anonyme"
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean min-h-[44px]"
        />
      </div>

      {/* Statut */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-muted">Statut</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'pending' | 'active' | 'archived')}
          className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean min-h-[44px]"
        >
          <option value="pending">En attente</option>
          <option value="active">Actif</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {/* Expiration */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="expiresAt" className="text-sm font-medium text-muted">
          Expiration (optionnel)
        </label>
        <input
          id="expiresAt"
          type="datetime-local"
          value={expiresAt ? expiresAt.slice(0, 16) : ''}
          onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
          className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean min-h-[44px]"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted">Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isSelected = tagIds.includes(tag.id)
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
                {tag.icon} {tag.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted">
          Options
          {hasVotes && (
            <span className="text-xs text-warning ml-2">(non modifiables — des votes existent)</span>
          )}
        </label>
        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOptionText(index, e.target.value)}
                disabled={hasVotes}
                maxLength={200}
                className="flex-1 px-4 py-3 rounded-xl bg-surface-1 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean min-h-[44px] disabled:opacity-50"
              />
              {!hasVotes && options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-danger rounded-lg hover:bg-surface-2 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {!hasVotes && options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="self-start mt-1 text-sm text-ocean hover:text-ocean-light transition-colors"
          >
            + Ajouter une option
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">Sondage mis à jour</p>}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Sauvegarder
        </Button>
        <Button variant="ghost" type="button" onClick={() => router.push('/admin')}>
          Retour
        </Button>
      </div>
    </form>
  )
}
