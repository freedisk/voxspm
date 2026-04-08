import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { resolveGeoColor } from '@/lib/og/geo-color';

export const runtime = 'edge';
export const alt = 'VoxSPM — Sondage citoyen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: poll } = await supabase
    .from('polls')
    .select('question, slug, poll_tags(tags(slug, name))')
    .eq('slug', params.slug)
    .single();

  // Fallback si sondage introuvable
  if (!poll) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#F8FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 500, color: '#0F172A', fontFamily: 'Georgia, serif', display: 'flex' }}>
            VoxSPM
          </div>
          <div style={{ fontSize: 24, color: '#64748B', marginTop: 20, display: 'flex' }}>
            Sondage introuvable
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Normaliser tags depuis poll_tags → [{slug, name}]
  type PollTagRow = { tags: { slug: string; name: string }[] | { slug: string; name: string } | null };
  const tags = ((poll.poll_tags ?? []) as PollTagRow[])
    .flatMap((pt) => {
      if (!pt.tags) return [];
      return Array.isArray(pt.tags) ? pt.tags : [pt.tags];
    });

  const geo = resolveGeoColor({ question: poll.question, tags });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#F8FAFB',
          display: 'flex',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Barre verticale géo gauche */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 12,
            height: '100%',
            background: geo.hex,
          }}
        />

        {/* Blob décoratif haut droite */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: '#1A6FB5',
            opacity: 0.06,
            display: 'flex',
          }}
        />

        {/* Contenu principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '80px 80px 60px 100px',
            width: '100%',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          {/* Header — logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', position: 'relative', width: 60, height: 44 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#1A6FB5',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 22,
                  top: 6,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#0C9A78',
                  opacity: 0.85,
                  display: 'flex',
                }}
              />
            </div>
            <div
              style={{
                marginLeft: 20,
                fontSize: 36,
                fontWeight: 500,
                color: '#0F172A',
                fontFamily: 'Georgia, serif',
                display: 'flex',
              }}
            >
              VoxSPM
            </div>
          </div>

          {/* Bloc central — eyebrow + question */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: geo.hex,
                letterSpacing: 2,
                marginBottom: 30,
                display: 'flex',
              }}
            >
              SONDAGE CITOYEN · {geo.label}
            </div>
            <div
              style={{
                fontSize: 54,
                fontWeight: 500,
                color: '#0F172A',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif',
                display: 'flex',
                maxWidth: 1000,
              }}
            >
              {poll.question}
            </div>
          </div>

          {/* Footer — URL */}
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#64748B',
            }}
          >
            voxspm.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
