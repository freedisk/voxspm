export type PollGeoInput = {
  question: string;
  tags?: Array<{ slug: string }> | null;
};

export function resolveGeoColor(poll: PollGeoInput): {
  hex: string;
  zone: 'saint_pierre' | 'miquelon' | 'exterieur';
  label: string;
} {
  const tags = poll.tags ?? [];

  // Priorité 1 — tag slug
  if (tags.some(t => t.slug.toLowerCase().includes('miquelon'))) {
    return { hex: '#0C9A78', zone: 'miquelon', label: 'MIQUELON' };
  }
  if (tags.some(t => /exterieur|diaspora/i.test(t.slug))) {
    return { hex: '#6B4FA0', zone: 'exterieur', label: 'EXTÉRIEUR' };
  }

  // Priorité 2 — regex sur la question
  if (/miquelon|langlade/i.test(poll.question)) {
    return { hex: '#0C9A78', zone: 'miquelon', label: 'MIQUELON' };
  }
  if (/diaspora|ext[ée]rieur|m[ée]tropole|continent/i.test(poll.question)) {
    return { hex: '#6B4FA0', zone: 'exterieur', label: 'EXTÉRIEUR' };
  }

  // Défaut — Saint-Pierre
  return { hex: '#1A6FB5', zone: 'saint_pierre', label: 'SAINT-PIERRE' };
}
