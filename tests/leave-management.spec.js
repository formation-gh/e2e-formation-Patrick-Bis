// @ts-check
const { test, expect } = require('@playwright/test');
const { prochainLundi, auFormatISO, UTILISATEURS_SEED } = require('./helpers');

/**
 * Remplit le formulaire de pose de congé avec une période d'un jour ouvré (un lundi)
 * et retourne la date utilisée au format ISO.
 * @param {import('@playwright/test').Page} page
 * @param {number} weeksAhead
 */
async function selectionnerPeriodeDUnJour(page, weeksAhead) {
  const date = auFormatISO(prochainLundi(new Date(), weeksAhead));
  const champDateDebut = page.locator('.leave-form label', { hasText: 'Date de début' }).locator('input');
  const champDateFin = page.locator('.leave-form label', { hasText: 'Date de fin' }).locator('input');

  await champDateDebut.fill(date);
  await champDateFin.fill(date);

  return date;
}

test.describe('Gestion des congés', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('.user-card', { hasText: UTILISATEURS_SEED[2].nom }).click();
  });

  test('poser un congé met à jour l’historique et le solde', async ({ page }) => {
    await selectionnerPeriodeDUnJour(page, 0);

    const bouton = page.getByRole('button', { name: 'Poser le congé' });
    await expect(bouton).toBeEnabled();
    await bouton.click();

    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);
    await expect(page.locator('h2:has-text("Congés posés") .count')).toHaveText('1');
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('24');
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText('1');
  });

  test('supprimer un congé le retire de l’historique et restaure le solde', async ({ page }) => {
    await selectionnerPeriodeDUnJour(page, 0);
    await page.getByRole('button', { name: 'Poser le congé' }).click();
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);

    await page.getByRole('button', { name: /Supprimer le congé du/ }).click();

    await expect(page.locator('.leave-list .leave-row')).toHaveCount(0);
    await expect(page.getByText('Aucun congé n’a été posé pour le moment.')).toBeVisible();
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('25');
  });

  test('refuse de poser un congé qui chevauche une période déjà posée', async ({ page }) => {
    await selectionnerPeriodeDUnJour(page, 1);
    await page.getByRole('button', { name: 'Poser le congé' }).click();
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);

    await selectionnerPeriodeDUnJour(page, 1);
    await page.getByRole('button', { name: 'Poser le congé' }).click();

    await expect(page.locator('.error-message')).toContainText(
      'Cette période chevauche un congé déjà posé.'
    );
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);
  });
});
