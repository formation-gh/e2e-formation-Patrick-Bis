// @ts-check
const { test, expect } = require('@playwright/test');
const { ouvrirApplication, UTILISATEURS_SEED } = require('./helpers');

test.describe('Liste des utilisateurs', () => {
  test.beforeEach(async ({ page }) => {
    await ouvrirApplication(page);
  });

  test("affiche le titre de l'écran d'accueil", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeVisible();
  });

  test('liste chaque utilisateur avec son nom et son email', async ({ page }) => {
    const cartes = page.locator('.user-card');
    await expect(cartes).toHaveCount(UTILISATEURS_SEED.length);

    for (const utilisateur of UTILISATEURS_SEED) {
      const carte = page.locator('.user-card', { hasText: utilisateur.nom });
      await expect(carte).toBeVisible();
      await expect(carte).toContainText(utilisateur.email);
    }
  });

  test('permet de naviguer vers la fiche d’un utilisateur', async ({ page }) => {
    const premierUtilisateur = UTILISATEURS_SEED[0];
    await page.locator('.user-card', { hasText: premierUtilisateur.nom }).click();

    await expect(page.getByRole('heading', { name: premierUtilisateur.nom })).toBeVisible();
    await expect(page.getByText(premierUtilisateur.email)).toBeVisible();
  });
});
