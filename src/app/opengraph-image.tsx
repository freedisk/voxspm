import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VoxSPM — Plateforme citoyenne de Saint-Pierre-et-Miquelon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
        {/* Barre verticale bleue SP gauche */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 12,
            height: '100%',
            background: '#1A6FB5',
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

          {/* Bloc central */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: '#1A6FB5',
                letterSpacing: 2,
                marginBottom: 30,
                display: 'flex',
              }}
            >
              PLATEFORME CITOYENNE
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
              Sondages citoyens de Saint-Pierre-et-Miquelon
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#64748B',
                marginTop: 32,
                display: 'flex',
              }}
            >
              Proposez. Votez. Participez.
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
