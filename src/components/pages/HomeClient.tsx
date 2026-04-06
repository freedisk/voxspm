'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import TagFilter from '@/components/polls/TagFilter'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface HomeClientProps {
  tags: Tag[]
  activeTagSlugs: string[]
}

// Composant client séparé pour gérer l'interactivité du TagFilter
// Le filtrage réel se fait côté serveur via les query params
export default function HomeClient({ tags, activeTagSlugs }: HomeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleToggle = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (slug === '__all__') {
      params.delete('tag')
    } else {
      const currentTags = params.getAll('tag')
      if (currentTags.includes(slug)) {
        params.delete('tag')
        currentTags.filter((t) => t !== slug).forEach((t) => params.append('tag', t))
      } else {
        params.append('tag', slug)
      }
    }

    // Replace pour ne pas polluer l'historique avec chaque toggle de filtre
    router.replace(`/?${params.toString()}`)
  }, [router, searchParams])

  return (
    <TagFilter
      tags={tags}
      activeTagSlugs={activeTagSlugs}
      onToggle={handleToggle}
    />
  )
}
