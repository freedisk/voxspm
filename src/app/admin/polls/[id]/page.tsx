import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PollEditor from '@/components/admin/PollEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPollEditPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: poll } = await supabase
    .from('polls')
    .select(`
      id, question, description, status, proposer_name, expires_at,
      options ( id, text, order_index, votes_count ),
      poll_tags ( tag_id )
    `)
    .eq('id', id)
    .single()

  if (!poll) notFound()

  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('order_index')

  const options = (poll.options as { id: string; text: string; order_index: number; votes_count: number }[])
    .sort((a, b) => a.order_index - b.order_index)

  const selectedTagIds = (poll.poll_tags as { tag_id: string }[]).map((pt) => pt.tag_id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Éditer le sondage</h1>
      <PollEditor
        poll={{
          id: poll.id,
          question: poll.question,
          description: poll.description,
          status: poll.status as 'pending' | 'active' | 'archived',
          proposer_name: poll.proposer_name,
          expires_at: poll.expires_at,
        }}
        options={options}
        selectedTagIds={selectedTagIds}
        allTags={allTags ?? []}
      />
    </div>
  )
}
