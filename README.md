# e2e-formation-Patrick-Bis
nouveau repertoir pour avoir la première branche

## Tests e2e — Application RH congés

Ce dépôt contient une suite de tests end-to-end [Playwright](https://playwright.dev/)
qui valide l'application de gestion des congés déployée à l'adresse :
https://aouzgaga.github.io/formation-gh-api/

### Ce qui est testé

- **`tests/users-list.spec.js`** : l'écran d'accueil affiche bien la liste des
  utilisateurs (nom, email) et permet de naviguer vers leur fiche.
- **`tests/user-details.spec.js`** : la fiche utilisateur affiche le solde de
  congés, les jours acquis, les jours pris, le lien retour vers la liste, et
  l'état désactivé du bouton de pose de congé tant qu'aucune période valide
  n'est sélectionnée.
- **`tests/leave-management.spec.js`** : la pose d'un congé met à jour
  l'historique et le solde, la suppression d'un congé le retire et restaure le
  solde, et le chevauchement de deux périodes est refusé avec un message
  d'erreur.

### Installation

```bash
npm install
npx playwright install --with-deps chromium
```

### Lancer les tests

```bash
npm test
```

Le rapport HTML peut ensuite être consulté avec :

```bash
npm run test:report
```
