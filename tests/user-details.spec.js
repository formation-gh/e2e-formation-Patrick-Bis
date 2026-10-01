// @ts-check
const { test, expect } = require('@playwright/test');
const { auFormatISO, ouvrirApplication, prochainLundi, scenario, UTILISATEURS_SEED } = require('./helpers');

test.describe('Fiche utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await ouvrirApplication(page);
    await page.locator('.user-card', { hasText: UTILISATEURS_SEED[0].nom }).click();
  });

  test('affiche le solde, les jours acquis et les jours pris', scenario(
    'Étant donné que j’ouvre la fiche d’un utilisateur\nAlors son solde, ses jours acquis et ses jours pris sont affichés',
    'Le solde disponible est de 25 jours, les jours acquis de 25 et les jours pris de 0'
  ), async ({ page }) => {
    await expect(page.locator('.balance-card', { hasText: 'Solde disponible' })).toContainText('25');
    await expect(page.locator('.balance-card', { hasText: 'Jours acquis' })).toContainText('25');
    await expect(page.locator('.balance-card', { hasText: 'Jours pris' })).toContainText('0');
  });

  test("n'affiche aucun congé pour un nouvel utilisateur", scenario(
    'Étant donné que j’ouvre la fiche d’un nouvel utilisateur\nAlors son historique de congés est vide',
    'Le message indiquant qu’aucun congé n’a été posé apparaît et aucune ligne de congé n’est présente'
  ), async ({ page }) => {
    await expect(page.getByText('Aucun congé n’a été posé pour le moment.')).toBeVisible();
    await expect(page.locator('.leave-list .leave-row')).toHaveCount(0);
  });

  test('le lien retour ramène vers la liste des utilisateurs', scenario(
    'Étant donné que je suis sur la fiche d’un utilisateur\nQuand je sélectionne le lien de retour\nAlors la liste des utilisateurs s’affiche',
    'Le titre « Les utilisateurs » est visible'
  ), async ({ page }) => {
    await page.getByRole('link', { name: /Tous les utilisateurs/ }).click();
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeVisible();
  });

  test('le bouton "Poser le congé" est désactivé sans jour ouvré sélectionné', scenario(
    'Étant donné que je choisis une période composée uniquement d’un samedi\nAlors la pose du congé est désactivée et une indication est affichée',
    'Le bouton « Poser le congé » est désactivé et le message sur les jours ouvrés est visible'
  ), async ({ page }) => {
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
