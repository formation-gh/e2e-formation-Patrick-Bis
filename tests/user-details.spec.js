// @ts-check
const { test, expect } = require('@playwright/test');
const { auFormatISO, ouvrirApplication, prochainLundi, UTILISATEURS_SEED } = require('./helpers');

test.describe('Fiche utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await ouvrirApplication(page);
    await page.locator('.user-card', { hasText: UTILISATEURS_SEED[0].nom }).click();
  });

  test('affiche le solde, les jours acquis et les jours pris', async ({ page }) => {
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('25');
    await expect(page.locator('.balance-card', { hasText: 'Jours acquis' })).toContainText('25');
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText('0');
  });

  test("n'affiche aucun congé pour un nouvel utilisateur", async ({ page }) => {
    await expect(page.getByText('Aucun congé n’a été posé pour le moment.')).toBeVisible();
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(0);
  });

  test('le lien retour ramène vers la liste des utilisateurs', async ({ page }) => {
    await page.getByRole('link', { name: /Tous les utilisateurs/ }).click();
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeVisible();
  });

  test('le bouton "Poser le congé" est désactivé sans jour ouvré sélectionné', async ({ page }) => {
    const samedi = prochainLundi(new Date());
    samedi.setDate(samedi.getDate() + 5);
    const date = auFormatISO(samedi);
    const champDateDebut = page.locator('.leave-form label', { hasText: 'Date de début' }).locator('input');
    const champDateFin = page.locator('.leave-form label', { hasText: 'Date de fin' }).locator('input');
    await champDateDebut.fill(date);
    await champDateFin.fill(date);

    const bouton = page.getByRole('button', { name: 'Poser le congé' });
    await expect(bouton).toBeDisabled();
    await expect(page.locator('.form-hint')).toContainText(
      'Choisissez une période contenant au moins un jour ouvré.'
    );
  });
});
