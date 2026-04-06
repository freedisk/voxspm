import { createClient } from '@/lib/supabase/server'
import TagsManager from '@/components/admin/TagsManager'

export default async function AdminTagsPage() {
  const supabase = await createClient()

  const { data: rawTags } = await supabase
    .from('tags')
    .select('*, poll_tags ( poll_id )')
    .order('order_index')

  const tags = (rawTags ?? []).map((tag) => ({
    id: tag.id as string,
    name: tag.name as string,
    slug: tag.slug as string,
    color: tag.color as string,
    icon: tag.icon as string,
    order_index: tag.order_index as number,
    // Compter les sondages associés via la jointure
    poll_count: (tag.poll_tags as { poll_id: string }[]).length,
  }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Gestion des tags</h1>
      <TagsManager tags={tags} />
    </div>
  )
}
