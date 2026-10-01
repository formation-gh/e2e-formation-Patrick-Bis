// @ts-check
const { test, expect } = require('@playwright/test');
const { ouvrirApplication, scenario } = require('./helpers');

test.describe('Authentification', () => {
  test('demande le mot de passe avant d’afficher l’application', scenario(
    'Étant donné que je suis sur la page d’accueil\nAlors le formulaire de connexion est affiché et l’application reste masquée',
    'Le formulaire de connexion est visible et la liste des utilisateurs est masquée'
  ), async ({ page }) => {
    await page.goto('.');

    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeHidden();
  });

  test('refuse un mot de passe incorrect', scenario(
    'Étant donné que je suis sur la page de connexion\nQuand je saisis un mot de passe incorrect\nAlors un message d’erreur est affiché et l’application reste masquée',
    'Le message « Mot de passe incorrect. » apparaît et le champ est vidé'
  ), async ({ page }) => {
    await page.goto('.');
    await page.getByLabel('Mot de passe').fill('incorrect');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('alert')).toHaveText('Mot de passe incorrect.');
    await expect(page.getByLabel('Mot de passe')).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeHidden();
  });

  test('ouvre l’application avec le mot de passe configuré', scenario(
    'Étant donné que je suis sur la page de connexion\nQuand je saisis le mot de passe configuré\nAlors la liste des utilisateurs s’affiche',
    'Le titre « Les utilisateurs » est visible'
  ), async ({ page }) => {
    await ouvrirApplication(page);

    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeVisible();
  });
});
