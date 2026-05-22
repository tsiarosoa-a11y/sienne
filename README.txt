📦 SIENNE — Fichiers d'authentification Supabase

Voici les fichiers à REMPLACER dans votre dossier `sienne/` :

✅ À COPIER/REMPLACER :
- .env.local (nouveau)
- lib/supabase.ts (nouveau)
- lib/auth.tsx (nouveau)
- app/auth/page.tsx (nouveau dossier app/auth/)
- app/layout.tsx (modifié)
- components/AppShell.tsx (modifié)

🚀 ÉTAPES :

1. Arrêtez le serveur (Ctrl + C dans le terminal)

2. Décompressez ce ZIP dans votre dossier `sienne/`
   → Il va demander si vous voulez remplacer les fichiers existants → Cliquez "Remplacer"

3. Vérifiez que vous avez bien tous les fichiers :
   ```bash
   ls -la .env.local lib/supabase.ts lib/auth.tsx app/auth/page.tsx
   ```

4. Relancez le serveur :
   ```bash
   npm run dev
   ```

5. Allez sur http://localhost:3000
   → Vous devriez voir l'écran de login !

6. Créez un compte :
   - Email : test@exemple.com
   - Mot de passe : password123
   - Cliquez "S'inscrire"

7. Une fois connecté, vous verrez le dashboard !

✨ Ça y est, l'authentification fonctionne !

Après, vous pouvez faire :
```bash
git add .
git commit -m "Add Supabase authentication"
git push origin main
```

Vercel redéploiera automatiquement ! 🚀
