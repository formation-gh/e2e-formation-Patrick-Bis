// @ts-check
const { test, expect } = require('@playwright/test');
const { ouvrirApplication } = require('./helpers');

test.describe('Authentification', () => {
  test('demande le mot de passe avant d’afficher l’application', async ({ page }) => {
    await page.goto('.');

    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeHidden();
  });

  test('refuse un mot de passe incorrect', async ({ page }) => {
    await page.goto('.');
    await page.getByLabel('Mot de passe').fill('incorrect');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('alert')).toHaveText('Mot de passe incorrect.');
    await expect(page.getByLabel('Mot de passe')).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeHidden();
  });

  test('ouvre l’application avec le mot de passe configuré', async ({ page }) => {
    await ouvrirApplication(page);

    await expect(page.getByRole('heading', { name: 'Les utilisateurs' })).toBeVisible();
  });
});
