Dans VoxSPM, les Server Actions échouent systématiquement
pour les sessions anonymes (cookie non transmis).

Fix définitif : utiliser le client Supabase browser
directement pour updateUserLocation et proposePoll.
Supprimer la dépendance aux Server Actions pour ces 2 cas.

─── ÉTAPE 1 : Lire SANS modifier ───

Lire dans l'ordre :
- lib/supabase/client.ts
- lib/context/GeoContext.tsx
- lib/context/SessionProvider.tsx
- app/proposer/page.tsx + composant formulaire
- lib/actions/polls.ts

─── ÉTAPE 2 : GeoContext — client direct ───

Modifier lib/context/GeoContext.tsx :

Supprimer l'import de updateUserLocation (Server Action).

Remplacer par une fonction interne utilisant
le client browser :

import { createClient } from '@/lib/supabase/client'

const persistLocation = async (
  userId: string,
  location: string
) => {
  const supabase = createClient()
  await supabase
    .from('profiles')
    .upsert({ id: userId, location })
    .eq('id', userId)
}

Dans la fonction qui gère le changement de location :
1. setLocation(newLocation) en premier (optimistic)
2. Fermer la modal
3. En background (sans await bloquant) :
   const supabase = createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
     await persistLocation(user.id, newLocation)
   }

Pas d'erreur UI si la persistance échoue — juste
console.error silencieux.

─── ÉTAPE 3 : ProposerForm — client direct ───

Dans le composant formulaire de /proposer :
Ajouter 'use client' si pas déjà présent.

Supprimer l'appel à la Server Action proposePoll.

Remplacer handleSubmit par une fonction async :

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)

  try {
    const supabase = createClient()
    
    // Récupérer ou créer session
    let { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const { data } = await supabase.auth.signInAnonymously()
      user = data.user
    }
    if (!user) throw new Error('Session impossible')

    // Insérer le sondage
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: formData.question,
        proposed_by: formData.pseudonyme || 'Anonyme',
        status: 'pending',
        user_id: user.id
      })
      .select()
      .single()

    if (pollError) throw pollError

    // Insérer les options
    const options = formData.options
      .filter(o => o.trim())
      .map((label, i) => ({
        poll_id: poll.id,
        label,
        order: i
      }))

    const { error: optError } = await supabase
      .from('options')
      .insert(options)

    if (optError) throw optError

    setSuccess(true)
  } catch (err) {
    console.error('proposePoll failed:', err)
    setError('Une erreur est survenue. Réessayez.')
  } finally {
    setIsSubmitting(false)
  }
}

Adapter les noms de champs (question, options, pseudonyme)
aux noms réels du formulaire existant.
Garder exactement le même design et UX du formulaire.

─── ÉTAPE 4 : Nettoyer lib/actions/polls.ts ───

Dans lib/actions/polls.ts :
- updateUserLocation : garder la fonction mais retourner
  { success: true } immédiatement sans appel Supabase
  (elle n'est plus appelée mais garder pour éviter les
  erreurs d'import si d'autres composants la référencent)
- proposePoll : idem, garder la signature, retourner
  { success: true } sans traitement
  Ces fonctions sont maintenant remplacées par le client
  direct — on les garde pour éviter les erreurs de build.

─── CONTRAINTES ───

Ne pas modifier :
- lib/hooks/ (tous les fichiers)
- lib/supabase/ (tous les fichiers)
- lib/actions/admin.ts
- Tous les fichiers admin
- Le schéma DB / migrations
- Le design et UX des composants

À la fin : npm run build doit passer sans erreur.