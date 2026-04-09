'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { createTag, updateTag, deleteTag } from '@/lib/actions/admin'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  order_index: number
  poll_count: number
}

interface TagsManagerProps {
  tags: Tag[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function TagsManager({ tags }: TagsManagerProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isActing, setIsActing] = useState(false)

  // Formulaire création
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#1B7FC4')
  const [newIcon, setNewIcon] = useState('🏷️')

  // Formulaire édition
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editOrder, setEditOrder] = useState(0)

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
    setEditIcon(tag.icon)
    setEditOrder(tag.order_index)
    setIsCreating(false)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setIsActing(true)
    await createTag(newName, slugify(newName), newColor, newIcon)
    setNewName('')
    setNewColor('#1B7FC4')
    setNewIcon('🏷️')
    setIsCreating(false)
    setIsActing(false)
    router.refresh()
  }

  async function handleUpdate() {
    if (!editingId || !editName.trim()) return
    setIsActing(true)
    await updateTag(editingId, {
      name: editName,
      slug: slugify(editName),
      color: editColor,
      icon: editIcon,
      order_index: editOrder,
    })
    setEditingId(null)
    setIsActing(false)
    router.refresh()
  }

  async function handleDelete(tag: Tag) {
    if (tag.poll_count > 0) {
      alert(`Ce tag est utilisé par ${tag.poll_count} sondage(s). Retirez-le des sondages d'abord.`)
      return
    }
    setIsActing(true)
    await deleteTag(tag.id)
    setIsActing(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bouton création */}
      {!isCreating ? (
        <Button
          variant="secondary"
          onClick={() => { setIsCreating(true); setEditingId(null) }}
          className="self-start"
        >
          + Nouveau tag
        </Button>
      ) : (
        <div className="bg-surface-1 rounded-xl p-4 border border-rock/20 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted">Nouveau tag</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Icône</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-16 px-2 py-2 rounded-lg bg-surface-2 border border-rock/20 text-center text-lg focus:outline-none focus:border-ocean"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <label className="text-xs text-muted">Nom</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom du tag"
                className="px-3 py-2 rounded-lg bg-surface-2 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean min-h-[44px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Couleur</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-[44px] rounded-lg border border-rock/20 cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} isLoading={isActing}>Créer</Button>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Annuler</Button>
            </div>
          </div>
          <p className="text-xs text-muted">Slug auto : <code className="text-ocean">{slugify(newName) || '...'}</code></p>
        </div>
      )}

      {/* Liste des tags */}
      <div className="flex flex-col gap-2">
        {tags.map((tag) => {
          const isEditing = editingId === tag.id

          if (isEditing) {
            return (
              <div key={tag.id} className="bg-surface-1 rounded-xl p-4 border border-ocean/30 flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Icône</label>
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="w-16 px-2 py-2 rounded-lg bg-surface-2 border border-rock/20 text-center text-lg focus:outline-none focus:border-ocean"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                    <label className="text-xs text-muted">Nom</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-surface-2 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean min-h-[44px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Couleur</label>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-12 h-[44px] rounded-lg border border-rock/20 cursor-pointer bg-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Ordre</label>
                    <input
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-lg bg-surface-2 border border-rock/20 text-foreground text-sm focus:outline-none focus:border-ocean min-h-[44px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} isLoading={isActing}>Sauvegarder</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>Annuler</Button>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={tag.id}
              className="bg-surface-1 rounded-xl px-4 py-3 border border-rock/20 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{tag.icon}</span>
                <span className="text-sm font-medium text-foreground">{tag.name}</span>
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-xs text-muted">
                  {tag.poll_count} sondage{tag.poll_count > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(tag)}
                  className="text-xs px-2 py-1 rounded bg-ocean/20 text-ocean hover:bg-ocean/30 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(tag)}
                  disabled={isActing}
                  className="text-xs px-2 py-1 rounded bg-danger/20 text-danger hover:bg-danger/30 transition-colors disabled:opacity-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
