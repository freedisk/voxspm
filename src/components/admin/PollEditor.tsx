'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { updatePoll, updatePollOptions, validatePoll, archivePoll, deletePoll } from '@/lib/actions/admin'

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
  total_votes: number
}

interface PollEditorProps {
  poll: PollData
  options: OptionData[]
  selectedTagIds: string[]
  allTags: Tag[]
  isEditable: boolean
}

interface LocalOption {
  id?: string
  text: string
  order_index: number
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: '#1CA87A' },
  pending: { label: 'En attente', color: '#E8A020' },
  archived: { label: 'Archivé', color: '#8A9BB0' },
}

export default function PollEditor({
  poll,
  options: initialOptions,
  selectedTagIds: initialTagIds,
  allTags,
  isEditable,
}: PollEditorProps) {
  const router = useRouter()
  const [question, setQuestion] = useState(poll.question)
  const [proposerName, setProposerName] = useState(poll.proposer_name ?? '')
  const [status, setStatus] = useState(poll.status)
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds)
  const [options, setOptions] = useState<LocalOption[]>(
    initialOptions.map((o) => ({ id: o.id, text: o.text, order_index: o.order_index }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const statusInfo = statusLabels[poll.status]

  function toggleTag(tagId: string) {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
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

    const pollResult = await updatePoll(poll.id, {
      question,
      proposer_name: proposerName || null,
      status,
      tagIds,
    })

    if (!pollResult.success) {
      setError(pollResult.error)
      setIsSubmitting(false)
      return
    }

    const optResult = await updatePollOptions(poll.id, options)
    if (!optResult.success) {
      setError(optResult.error)
      setIsSubmitting(false)
      return
    }

    setSuccess(true)
    router.refresh()
    setIsSubmitting(false)
  }

  async function handleQuickAction(action: () => Promise<{ success: boolean; error?: string }>) {
    setIsSubmitting(true)
    setError(null)
    const result = await action()
    if (!result.success && 'error' in result) {
      setError(result.error ?? 'Erreur')
    }
    router.refresh()
    setIsSubmitting(false)
  }

  const inputClass = `
    w-full px-4 py-3 rounded-[var(--radius-sm)] text-sm min-h-[44px]
    transition-all duration-200
  `
  const inputStyle = {
    border: '1.5px solid var(--border-strong)',
    color: 'var(--text-primary)',
    background: 'var(--white)',
  }
  const readonlyStyle = {
    ...inputStyle,
    background: 'var(--surface-2)',
    color: 'var(--text-secondary)',
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête : statut + votes */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-block px-3 py-1 rounded-[var(--radius-pill)] text-xs font-medium"
          style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
        >
          {statusInfo.label}
        </span>
        <span className="text-sm tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {poll.total_votes} vote{poll.total_votes > 1 ? 's' : ''}
        </span>

        {/* Actions rapides */}
        <div className="flex gap-2 ml-auto">
          {poll.status === 'pending' && (
            <Button
              variant="primary"
              onClick={() => handleQuickAction(() => validatePoll(poll.id))}
              isLoading={isSubmitting}
              className="text-xs"
            >
              ✅ Activer
            </Button>
          )}
          {poll.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() => handleQuickAction(() => archivePoll(poll.id))}
              isLoading={isSubmitting}
              className="text-xs"
            >
              📦 Archiver
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Supprimer définitivement ce sondage et tous ses votes ?')) {
                handleQuickAction(async () => {
                  const r = await deletePoll(poll.id)
                  if (r.success) router.push('/admin')
                  return r
                })
              }
            }}
            isLoading={isSubmitting}
            className="text-xs"
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Bandeau lecture seule */}
      {!isEditable && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#92400E',
          }}
        >
          Ce sondage a reçu des votes et ne peut plus être modifié.
        </div>
      )}

      <form onSubmit={isEditable ? handleSubmit : (e) => e.preventDefault()} className="flex flex-col gap-6">
        {/* Question */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Question
          </label>
          {isEditable ? (
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              maxLength={300}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {poll.question}
            </p>
          )}
        </div>

        {/* Options de réponse */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Options de réponse
          </label>
          <div className="flex flex-col gap-2.5">
            {(isEditable ? options : initialOptions).map((option, index) => (
              <div key={'id' in option ? option.id : `new-${index}`} className="flex items-center gap-2">
                <span className="text-xs font-medium w-6 text-center shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {index + 1}
                </span>
                {isEditable ? (
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={200}
                    className={`flex-1 ${inputClass}`}
                    style={inputStyle}
                  />
                ) : (
                  <div className={`flex-1 ${inputClass}`} style={readonlyStyle}>
                    {option.text}
                    {'votes_count' in option && (
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        ({(option as OptionData).votes_count} votes)
                      </span>
                    )}
                  </div>
                )}
                {isEditable && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-200"
                    style={{ color: 'var(--danger)' }}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditable && options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="self-start mt-1 text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--ocean)' }}
            >
              + Ajouter une option
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tags</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = tagIds.includes(tag.id)
              if (!isEditable && !isSelected) return null
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={isEditable ? () => toggleTag(tag.id) : undefined}
                  disabled={!isEditable}
                  className="min-h-[44px] px-4 py-2 rounded-[var(--radius-pill)] text-sm font-medium border transition-all duration-200 flex items-center gap-1.5 disabled:cursor-default"
                  style={isSelected ? {
                    background: tag.color,
                    color: 'var(--white)',
                    borderColor: tag.color,
                  } : {
                    background: 'var(--white)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-strong)',
                  }}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Statut */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Statut</label>
          {isEditable ? (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'pending' | 'active')}
              className={inputClass}
              style={inputStyle}
            >
              <option value="pending">En attente</option>
              <option value="active">Actif</option>
            </select>
          ) : (
            <span
              className="inline-block px-3 py-1 rounded-[var(--radius-pill)] text-xs font-medium w-fit"
              style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
            >
              {statusInfo.label}
            </span>
          )}
        </div>

        {/* Proposant (éditable) */}
        {isEditable && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Proposant</label>
            <input
              type="text"
              value={proposerName}
              onChange={(e) => setProposerName(e.target.value)}
              placeholder="Anonyme"
              maxLength={50}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        )}

        {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: 'var(--success)' }}>Sondage mis à jour</p>}

        <div className="flex gap-3">
          {isEditable && (
            <Button type="submit" isLoading={isSubmitting}>
              Enregistrer les modifications
            </Button>
          )}
          <Button variant="ghost" type="button" onClick={() => router.push('/admin')}>
            Retour
          </Button>
        </div>
      </form>
    </div>
  )
}
