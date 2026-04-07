-- Permettre aux utilisateurs anonymes de proposer un sondage
CREATE POLICY "anon can insert polls"
ON polls
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permettre aux utilisateurs anonymes d'insérer des options
CREATE POLICY "anon can insert options"
ON options
FOR INSERT
TO authenticated
WITH CHECK (true);
