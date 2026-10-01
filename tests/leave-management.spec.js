// @ts-check
const { test, expect } = require('@playwright/test');
const { prochainLundi, auFormatISO, ouvrirApplication, scenario, UTILISATEURS_SEED } = require('./helpers');

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
    await ouvrirApplication(page);
    await page.locator('.user-card', { hasText: UTILISATEURS_SEED[2].nom }).click();
  });

  test('poser un congé met à jour l’historique et le solde', scenario(
    'Étant donné que je suis sur la fiche d’un utilisateur\nQuand je pose un congé d’un jour ouvré\nAlors l’historique et le solde sont mis à jour',
    'Un congé est ajouté, le solde disponible passe à 24 jours et les jours pris à 1'
  ), async ({ page }) => {
    await selectionnerPeriodeDUnJour(page, 0);

    const bouton = page.getByRole('button', { name: 'Poser le congé' });
    await expect(bouton).toBeEnabled();
    await bouton.click();

    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);
    await expect(page.locator('h2:has-text("Congés posés") .count')).toHaveText('1');
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('24');
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText('1');
  });

  test('supprimer un congé le retire de l’historique et restaure le solde', scenario(
    'Étant donné qu’un congé a été posé\nQuand je supprime ce congé\nAlors il disparaît de l’historique et le solde est restauré',
    'Aucun congé ne reste affiché et le solde disponible revient à 25 jours'
  ), async ({ page }) => {
    await selectionnerPeriodeDUnJour(page, 0);
    await page.getByRole('button', { name: 'Poser le congé' }).click();
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);

    await page.getByRole('button', { name: /Supprimer le congé du/ }).click();

    await expect(page.locator('.leave-list .leave-row')).toHaveCount(0);
    await expect(page.getByText('Aucun congé n’a été posé pour le moment.')).toBeVisible();
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('25');
  });

  test('refuse de poser un congé qui chevauche une période déjà posée', scenario(
    'Étant donné qu’un congé a déjà été posé sur une période\nQuand je tente de poser un congé sur la même période\nAlors l’opération est refusée et un message d’erreur apparaît',
    'Le message de chevauchement apparaît et une seule ligne de congé reste affichée'
  ), async ({ page }) => {
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
