// @ts-check
const { test, expect } = require('@playwright/test');
const { prochainLundi, auFormatISO, ouvrirApplication, scenario, UTILISATEURS_SEED } = require('./helpers');

/**
 * Remplit le formulaire avec le nombre demandé de jours ouvrés à partir d'un lundi futur.
 * @param {import('@playwright/test').Page} page
 * @param {number} nombreJours
 * @param {number} weeksAhead
 */
async function selectionnerPeriodeJoursOuvres(page, nombreJours, weeksAhead = 0) {
  const debut = prochainLundi(new Date(), weeksAhead);
  const fin = new Date(debut);
  let joursOuvres = 1;

  while (joursOuvres < nombreJours) {
    fin.setDate(fin.getDate() + 1);
    if (fin.getDay() !== 0 && fin.getDay() !== 6) joursOuvres += 1;
  }

  const dateDebut = auFormatISO(debut);
  const dateFin = auFormatISO(fin);
  const champDateDebut = page.locator('.leave-form label', { hasText: 'Date de début' }).locator('input');
  const champDateFin = page.locator('.leave-form label', { hasText: 'Date de fin' }).locator('input');

  await champDateDebut.fill(dateDebut);
  await champDateFin.fill(dateFin);
}

test.describe('Gestion des congés', () => {
  test.beforeEach(async ({ page }) => {
    await ouvrirApplication(page);
    await page.locator('.user-card', { hasText: UTILISATEURS_SEED[2].nom }).click();
  });

  test('poser un jour de congé met à jour l’historique et le solde', scenario(
    'Étant donné que je suis sur la fiche d’un utilisateur\nQuand je pose un congé d’un jour ouvré\nAlors l’historique et le solde sont mis à jour',
    'Un congé est ajouté, le solde disponible passe à 24 jours et les jours pris à 1'
  ), async ({ page }) => {
    await selectionnerPeriodeJoursOuvres(page, 1);

    const bouton = page.getByRole('button', { name: 'Poser le congé' });
    await expect(bouton).toBeEnabled();
    await bouton.click();

    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);
    await expect(page.locator('h2:has-text("Congés posés") .count')).toHaveText('1');
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('24');
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText('1');
  });

  test('refuse une demande de 26 jours de congé', scenario(
    'Étant donné que le solde disponible est de 25 jours\nQuand je demande 26 jours ouvrés de congé\nAlors la demande est refusée sans modifier l’historique ni le solde',
    'Aucun congé n’est ajouté, le solde disponible reste à 25 jours et les jours pris à 0'
  ), async ({ page }) => {
    await selectionnerPeriodeJoursOuvres(page, 26);

    const bouton = page.getByRole('button', { name: 'Poser le congé' });
    await expect(bouton).toBeEnabled();
    await bouton.click();

    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(0);
    await expect(page.getByText('Aucun congé n’a été posé pour le moment.')).toBeVisible();
    await expect(page.locator('h2:has-text("Congés posés") .count')).toHaveText('0');
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('25');
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText('0');
  });

  test('poser un nombre aléatoire de 1 à 5 jours met à jour l’historique et le solde', scenario(
    'Étant donné que je suis sur la fiche d’un utilisateur\nQuand je pose un nombre aléatoire de 1 à 5 jours ouvrés\nAlors l’historique et le solde reflètent le nombre de jours posés',
    'Un congé est ajouté, les jours pris correspondent au nombre tiré et le solde disponible est diminué en conséquence'
  ), async ({ page }) => {
    const nombreJours = Math.floor(Math.random() * 5) + 1;
    await selectionnerPeriodeJoursOuvres(page, nombreJours);

    await page.getByRole('button', { name: 'Poser le congé' }).click();

    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);
    await expect(page.locator('h2:has-text("Congés posés") .count')).toHaveText('1');
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText(
      String(25 - nombreJours)
    );
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText(
      String(nombreJours)
    );
  });

  test('poser tous les jours disponibles met le solde à zéro', scenario(
    'Étant donné que le solde disponible est de 25 jours\nQuand je pose tous mes jours ouvrés disponibles\nAlors l’historique est mis à jour et le solde disponible passe à zéro',
    'Un congé de 25 jours ouvrés est ajouté, le solde disponible passe à 0 et les jours pris à 25'
  ), async ({ page }) => {
    await selectionnerPeriodeJoursOuvres(page, 25);

    await page.getByRole('button', { name: 'Poser le congé' }).click();

    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);
    await expect(page.locator('h2:has-text("Congés posés") .count')).toHaveText('1');
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('0');
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText('25');
  });

  test('supprimer un congé le retire de l’historique et restaure le solde', scenario(
    'Étant donné qu’un congé a été posé\nQuand je supprime ce congé\nAlors il disparaît de l’historique et le solde est restauré',
    'Aucun congé ne reste affiché et le solde disponible revient à 25 jours'
  ), async ({ page }) => {
    await selectionnerPeriodeJoursOuvres(page, 1);
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
    await selectionnerPeriodeJoursOuvres(page, 1, 1);
    await page.getByRole('button', { name: 'Poser le congé' }).click();
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);

    await selectionnerPeriodeJoursOuvres(page, 1, 1);
    await page.getByRole('button', { name: 'Poser le congé' }).click();

    await expect(page.locator('.error-message')).toContainText(
      'Cette période chevauche un congé déjà posé.'
    );
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(1);
  });
});
