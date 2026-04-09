'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { validatePoll, archivePoll, reactivatePoll, deletePoll } from '@/lib/actions/admin'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface Poll {
  id: string
  question: string
  slug: string
  status: 'pending' | 'active' | 'archived'
  total_votes: number
  votes_sp: number
  votes_miq: number
  votes_ext: number
  proposed_at: string
  proposer_name: string | null
  tags: Tag[]
}

interface PollsTableProps {
  polls: Poll[]
  newPollIds?: Set<string>
}

type StatusFilter = 'all' | 'active' | 'pending' | 'archived'

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: '#1CA87A' },
  pending: { label: 'En attente', color: '#E8A020' },
  archived: { label: 'Archivé', color: '#4B5F7C' },
}

export default function PollsTable({ polls, newPollIds }: PollsTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Poll | null>(null)
  const [isActing, setIsActing] = useState<string | null>(null)

  const filtered = polls.filter((poll) => {
    if (statusFilter !== 'all' && poll.status !== statusFilter) return false
    if (search && !poll.question.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleAction(action: () => Promise<unknown>, pollId: string) {
    setIsActing(pollId)
    await action()
    router.refresh()
    setIsActing(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsActing(deleteTarget.id)
    await deletePoll(deleteTarget.id)
    setDeleteTarget(null)
    router.refresh()
    setIsActing(null)
  }

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'active', label: 'Actifs' },
    { key: 'pending', label: 'En attente' },
    { key: 'archived', label: 'Archivés' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-surface-1 rounded-lg p-1 border border-rock/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${statusFilter === tab.key
                  ? 'bg-ocean text-white'
                  : 'text-muted hover:text-foreground'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="
            flex-1 px-4 py-2 rounded-lg bg-surface-1 border border-rock/20
            text-foreground placeholder:text-muted/50 text-sm
            focus:outline-none focus:border-ocean min-h-[44px]
          "
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rock/20 text-left text-muted">
              <th className="py-3 pr-4 font-medium">Question</th>
              <th className="py-3 pr-4 font-medium hidden sm:table-cell">Tags</th>
              <th className="py-3 pr-4 font-medium">Statut</th>
              <th className="py-3 pr-4 font-medium text-right">Votes</th>
              <th className="py-3 pr-4 font-medium hidden md:table-cell">Géo</th>
              <th className="py-3 pr-4 font-medium hidden lg:table-cell">Date</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((poll) => {
              const status = statusLabels[poll.status]
              const date = new Date(poll.proposed_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })
              const acting = isActing === poll.id

              const isNew = newPollIds?.has(poll.id) ?? false

              return (
                <tr
                  key={poll.id}
                  className={`border-b border-rock/10 hover:bg-surface-2/50 transition-colors ${
                    isNew ? 'bg-[#1A6FB5]/5 ring-1 ring-inset ring-[#1A6FB5]/30' : ''
                  }`}
                >
                  <td className="py-3 pr-4 max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground truncate">{poll.question}</p>
                      {isNew && (
                        <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[#1A6FB5]/15 text-[#1A6FB5] animate-pulse">
                          ✨ Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{poll.proposer_name ?? 'Anonyme'}</p>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {poll.tags.map((tag) => (
                        <Badge key={tag.id} label={tag.name} color={tag.color} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                    {poll.total_votes}
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <div className="flex gap-1">
                      {poll.votes_sp > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1B7FC420', color: '#1B7FC4' }}>
                          SP {poll.votes_sp}
                        </span>
                      )}
                      {poll.votes_miq > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#10A58520', color: '#10A585' }}>
                          Miq {poll.votes_miq}
                        </span>
                      )}
                      {poll.votes_ext > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#7B5EA720', color: '#7B5EA7' }}>
                          Ext {poll.votes_ext}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted hidden lg:table-cell">{date}</td>
                  <td className="py-3">
                    <div className="flex gap-1 flex-wrap">
                      {/* Bouton éditer/consulter — présent sur TOUTES les lignes */}
                      <button
                        onClick={() => router.push(`/admin/polls/${poll.id}`)}
                        className="text-xs px-2 py-1 rounded bg-ocean/20 text-ocean hover:bg-ocean/30 transition-colors"
                        title={poll.total_votes === 0 && poll.status !== 'archived' ? 'Éditer' : 'Consulter'}
                      >
                        ✏️
                      </button>
                      {poll.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(() => validatePoll(poll.id), poll.id)}
                            disabled={acting}
                            className="text-xs px-2 py-1 rounded bg-success/20 text-success hover:bg-success/30 transition-colors disabled:opacity-50"
                            title="Valider"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => setDeleteTarget(poll)}
                            disabled={acting}
                            className="text-xs px-2 py-1 rounded bg-danger/20 text-danger hover:bg-danger/30 transition-colors disabled:opacity-50"
                            title="Rejeter"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {poll.status === 'active' && (
                        <button
                          onClick={() => handleAction(() => archivePoll(poll.id), poll.id)}
                          disabled={acting}
                          className="text-xs px-2 py-1 rounded bg-rock/20 text-muted hover:bg-rock/30 transition-colors disabled:opacity-50"
                          title="Archiver"
                        >
                          📦
                        </button>
                      )}
                      {poll.status === 'archived' && (
                        <>
                          <button
                            onClick={() => handleAction(() => reactivatePoll(poll.id), poll.id)}
                            disabled={acting}
                            className="text-xs px-2 py-1 rounded bg-success/20 text-success hover:bg-success/30 transition-colors disabled:opacity-50"
                            title="Réactiver"
                          >
                            ♻️
                          </button>
                          <button
                            onClick={() => setDeleteTarget(poll)}
                            disabled={acting}
                            className="text-xs px-2 py-1 rounded bg-danger/20 text-danger hover:bg-danger/30 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-muted py-8">Aucun sondage trouvé</p>
        )}
      </div>

      {/* Modal double confirmation suppression */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression"
      >
        <p className="text-sm text-muted mb-2">
          Supprimer définitivement ce sondage et tous ses votes ?
        </p>
        <p className="text-sm text-foreground font-medium mb-4 line-clamp-2">
          « {deleteTarget?.question} »
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isActing === deleteTarget?.id}
          >
            Supprimer définitivement
          </Button>
        </div>
      </Modal>
    </div>
  )
}
