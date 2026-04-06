import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPollWithOptions } from '@/lib/actions/admin'
import PollEditor from '@/components/admin/PollEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPollEditPage({ params }: PageProps) {
  const { id } = await params

  const result = await getPollWithOptions(id)

  if (!result.success || !('data' in result)) notFound()

  const { poll, options, selectedTagIds, isEditable } = result.data

  const supabase = await createClient()
  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('order_index')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {isEditable ? 'Éditer le sondage' : 'Consulter le sondage'}
      </h1>
      <PollEditor
        poll={poll}
        options={options}
        selectedTagIds={selectedTagIds}
        allTags={allTags ?? []}
        isEditable={isEditable}
      />
    </div>
  )
}
