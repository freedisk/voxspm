'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import Button from '@/components/ui/Button'
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

// 🎨 Intent: couleurs dots pour les options du formulaire
const dotColors = ['#1A6FB5', '#0C9A78', '#6B4FA0', '#E8A020', '#D94F4F', '#8A9BB0']

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
      if (prev.includes(tagId)) return prev.filter((id) => id !== tagId)
      if (prev.length >= 3) return prev
      return [...prev, tagId]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = proposePollSchema.safeParse({ question, options })
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          proposer_name: proposerName || null,
          options: options.filter((o) => o.trim()),
          tag_ids: selectedTagIds,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      setSuccess(true)
      setQuestion('')
      setProposerName('')
      setOptions(['', ''])
      setSelectedTagIds([])
    } catch (err) {
      console.error('proposePoll failed:', err)
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-[480px] mx-auto text-center py-20">
        <div className="text-4xl mb-4">🗳️</div>
        <h1
          className="text-2xl mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
        >
          Merci !
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          Votre proposition sera examinée sous 48h.
        </p>
        <Button variant="ghost" onClick={() => setSuccess(false)}>
          Proposer un autre sondage
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* 🎨 Intent: lien retour discret */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm mb-6 transition-colors duration-200"
        style={{ color: 'var(--text-muted)' }}
      >
        ← Retour aux sondages
      </Link>

      {/* 🎨 Intent: titre Instrument Serif avec "sondage" en italic ocean */}
      <h1
        className="mb-8 tracking-[-0.5px]"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 40px)',
          color: 'var(--text-primary)',
        }}
      >
        Proposer un{' '}
        <em style={{ color: 'var(--ocean)', fontStyle: 'italic' }}>sondage</em>
      </h1>

      {/* 🎨 Intent: card blanche avec shadow-md pour le formulaire */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[var(--radius)] border p-6 sm:p-8 flex flex-col gap-6"
        style={{
          background: 'var(--white)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Question */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="question"
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Question <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Faut-il développer le transport maritime inter-îles ?"
            maxLength={300}
            rows={3}
            className="w-full px-4 py-3 rounded-[var(--radius-sm)] text-sm resize-none transition-all duration-200"
            style={{
              border: '1.5px solid var(--border-strong)',
              color: 'var(--text-primary)',
              background: 'var(--white)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--ocean)'
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--ocean-glow)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <span className="text-xs text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {question.length}/300
          </span>
        </div>

        {/* Nom */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="proposerName"
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Votre nom ou pseudonyme
          </label>
          <input
            id="proposerName"
            type="text"
            value={proposerName}
            onChange={(e) => setProposerName(e.target.value)}
            placeholder="Anonyme"
            maxLength={50}
            className="w-full px-4 py-3 rounded-[var(--radius-sm)] text-sm min-h-[44px] transition-all duration-200"
            style={{
              border: '1.5px solid var(--border-strong)',
              color: 'var(--text-primary)',
              background: 'var(--white)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--ocean)'
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--ocean-glow)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
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
                  className="
                    min-h-[44px] px-4 py-2 rounded-[var(--radius-pill)]
                    text-xs font-medium border transition-all duration-200
                    flex items-center gap-1.5
                  "
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

        {/* Options */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Options de réponse <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div className="flex flex-col gap-2.5">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* 🎨 Intent: dot coloré à gauche de chaque option */}
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: dotColors[index % dotColors.length] }}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                  className="flex-1 px-4 py-3 rounded-[var(--radius-sm)] text-sm min-h-[44px] transition-all duration-200"
                  style={{
                    border: '1.5px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    background: 'var(--white)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ocean)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--ocean-glow)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-200"
                    style={{ color: 'var(--text-muted)' }}
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
              className="self-start mt-1 text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--ocean)' }}
            >
              + Ajouter une option
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        {/* 🎨 Intent: bouton submit full-width ocean avec shadow bleu */}
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Envoyer ma proposition
        </Button>
      </form>
    </div>
  )
}
