// @ts-check
const { test, expect } = require('@playwright/test');
const { ouvrirApplication, scenario, UTILISATEURS_SEED } = require('./helpers');

test.describe('Liste des utilisateurs', () => {
  test.beforeEach(async ({ page }) => {
    await ouvrirApplication(page);
  });

  scenario(test, "affiche le titre de l'écran d'accueil",
    'Étant donné que je suis sur la page d’accueil\nAlors le titre de la liste des utilisateurs est visible',
    'Le titre « Les utilisateurs » est visible',
    async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeVisible();
  });

  scenario(test, 'liste chaque utilisateur avec son nom et son email',
    'Étant donné que la liste des utilisateurs est affichée\nAlors chaque utilisateur apparaît avec son nom et son adresse e-mail',
    'Les utilisateurs de référence sont tous affichés avec leur nom et leur e-mail',
    async ({ page }) => {
    const cartes = page.locator('.user-card');
    await expect(cartes).toHaveCount(UTILISATEURS_SEED.length);

    for (const utilisateur of UTILISATEURS_SEED) {
      const carte = page.locator('.user-card', { hasText: utilisateur.nom });
      await expect(carte).toBeVisible();
      await expect(carte).toContainText(utilisateur.email);
    }
  });

  scenario(test, 'permet de naviguer vers la fiche d’un utilisateur',
    'Étant donné que la liste des utilisateurs est affichée\nQuand je sélectionne un utilisateur\nAlors sa fiche est affichée',
    'La fiche affiche le nom et l’adresse e-mail de l’utilisateur sélectionné',
    async ({ page }) => {
    const premierUtilisateur = UTILISATEURS_SEED[0];
    await page.locator('.user-card', { hasText: premierUtilisateur.nom }).click();

    await expect(page.getByRole('heading', { name: premierUtilisateur.nom })).toBeVisible();
    await expect(page.getByText(premierUtilisateur.email)).toBeVisible();
  });
});
