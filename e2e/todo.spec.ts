import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Registers a new unique user and waits for the redirect to /todos. */
async function registerValidUser(page: Page, email?: string) {
  const uniqueEmail = email ?? `user_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

  // Home starts on login — switch to register
  await page.getByRole('button', { name: 'Créer un compte' }).click();

  await page.getByLabel('Prénom').fill('Jean');
  await page.getByLabel('Nom', { exact: true }).fill('Dupont');
  await page.getByLabel('Adresse email').fill(uniqueEmail);
  await page.getByLabel('Date de naissance').fill('2000-01-15');
  await page.getByLabel('Mot de passe').fill('Passw0rd');
  await page.getByRole('button', { name: "S'inscrire" }).click();

  // Wait until redirected to /todos with the todo list heading visible
  await page.waitForURL('/todos');
  await expect(page.getByRole('heading', { name: 'Ma TodoList' })).toBeVisible();
}

/** Logs in an existing user and waits for the redirect to /todos. */
async function loginUser(page: Page, email: string, password = 'Passw0rd') {
  await page.getByLabel('Adresse email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await page.waitForURL('/todos');
  await expect(page.getByRole('heading', { name: 'Ma TodoList' })).toBeVisible();
}

// ─── Login page ───────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the login form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
    await expect(page.getByLabel('Adresse email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('should switch to register form when clicking "Créer un compte"', async ({ page }) => {
    await page.getByRole('button', { name: 'Créer un compte' }).click();
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
  });

  test('should show an error on invalid credentials', async ({ page }) => {
    await page.getByLabel('Adresse email').fill('nobody@example.com');
    await page.getByLabel('Mot de passe').fill('WrongPass1');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible();
  });

  test('should not navigate to /todos if login fails', async ({ page }) => {
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
  });

  test('should redirect to /todos after successful login', async ({ page }) => {
    // First register a user
    const email = `login_${Date.now()}@example.com`;
    await page.getByRole('button', { name: 'Créer un compte' }).click();
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill(email);
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('Passw0rd');
    await page.getByRole('button', { name: "S'inscrire" }).click();
    await page.waitForURL('/todos');

    // Log out then log back in
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await page.waitForURL('/');
    // Wait for login form to be ready before interacting
    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
    await loginUser(page, email);
    await expect(page).toHaveURL('/todos');
  });
});

// ─── Registration ─────────────────────────────────────────────────────────────

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Créer un compte' }).click();
  });

  test('should display the registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
    await expect(page.getByLabel('Prénom')).toBeVisible();
    await expect(page.getByLabel('Nom', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Adresse email')).toBeVisible();
    await expect(page.getByLabel('Date de naissance')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: "S'inscrire" })).toBeVisible();
  });

  test('should register a valid user and redirect to /todos', async ({ page }) => {
    const email = `reg_${Date.now()}@example.com`;
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill(email);
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('Passw0rd');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await page.waitForURL('/todos');
    await expect(page.getByRole('heading', { name: 'Ma TodoList' })).toBeVisible();
  });

  test('should show a welcome message after registration', async ({ page }) => {
    await page.goto('/');
    await registerValidUser(page);
    await expect(page.getByText('Bienvenue,')).toBeVisible();
    await expect(page.getByText('Jean Dupont')).toBeVisible();
  });

  // ─── Validation errors ───────────────────────────────────────────────────

  test('should show an error when firstname is missing', async ({ page }) => {
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill('test@example.com');
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('Passw0rd');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Le prénom est requis.')).toBeVisible();
  });

  test('should show an error when lastname is missing', async ({ page }) => {
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Adresse email').fill('test2@example.com');
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('Passw0rd');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Le nom est requis.')).toBeVisible();
  });

  test('should show an error when email is invalid', async ({ page }) => {
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill('not-an-email');
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('Passw0rd');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText("L'adresse email n'est pas valide.")).toBeVisible();
  });

  test('should show an error when password is too short', async ({ page }) => {
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill('short@example.com');
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('Ab1');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Le mot de passe doit contenir entre 8 et 40 caractères.')).toBeVisible();
  });

  test('should show an error when password has no uppercase letter', async ({ page }) => {
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill('upper@example.com');
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('passw0rd');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Le mot de passe doit contenir au moins une majuscule.')).toBeVisible();
  });

  test('should show an error when password has no digit', async ({ page }) => {
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill('digit@example.com');
    await page.getByLabel('Date de naissance').fill('2000-01-15');
    await page.getByLabel('Mot de passe').fill('Password');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Le mot de passe doit contenir au moins un chiffre.')).toBeVisible();
  });

  test('should show an error when user is under 13', async ({ page }) => {
    const today = new Date();
    const underAge = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    const birthdateStr = underAge.toISOString().split('T')[0];

    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Adresse email').fill('young@example.com');
    await page.getByLabel('Date de naissance').fill(birthdateStr);
    await page.getByLabel('Mot de passe').fill('Passw0rd');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Vous devez avoir au moins 13 ans.')).toBeVisible();
  });

  test('should not navigate to /todos if registration fails', async ({ page }) => {
    await page.getByRole('button', { name: "S'inscrire" }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
  });
});

// ─── Todo List (requires prior registration) ──────────────────────────────────

test.describe('Todo List App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await registerValidUser(page);
  });

  // ─── Layout ──────────────────────────────────────────────────────────────

  test('should display the todo list heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ma TodoList' })).toBeVisible();
  });

  test('should display the input field and Ajouter button', async ({ page }) => {
    await expect(page.getByPlaceholder("Nom de l'item…")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ajouter' })).toBeVisible();
  });

  // ─── Add todo ────────────────────────────────────────────────────────────

  test('should add a new todo', async ({ page }) => {
    const todoName = `Test todo ${Date.now()}`;

    await page.getByPlaceholder("Nom de l'item…").fill(todoName);
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByText(todoName)).toBeVisible();
  });

  test('should clear the input after adding a todo', async ({ page }) => {
    await page.getByPlaceholder("Nom de l'item…").fill('A todo to add');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByPlaceholder("Nom de l'item…")).toHaveValue('');
  });

  test('should update the item count after adding a todo', async ({ page }) => {
    const countLocator = page.getByText(/^\d+ \/ 10 items$/);

    await expect(countLocator).toBeVisible();
    const initialText = await countLocator.textContent();
    const initialCount = parseInt(initialText ?? '0');

    await page.getByPlaceholder("Nom de l'item…").fill('Count test todo');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(countLocator).toHaveText(`${initialCount + 1} / 10 items`);
  });

  test('should add a todo by pressing Enter', async ({ page }) => {
    const todoName = `Enter key todo ${Date.now()}`;

    await page.getByPlaceholder("Nom de l'item…").fill(todoName);
    await page.getByPlaceholder("Nom de l'item…").press('Enter');

    await expect(page.getByText(todoName)).toBeVisible();
  });

  // ─── Delete todo ──────────────────────────────────────────────────────────

  test('should delete a todo', async ({ page }) => {
    const todoName = `Todo to delete ${Date.now()}`;

    await page.getByPlaceholder("Nom de l'item…").fill(todoName);
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.getByText(todoName)).toBeVisible();

    const todoItem = page.locator('li').filter({ hasText: todoName });
    await todoItem.getByRole('button', { name: 'Supprimer' }).click();

    await expect(page.getByText(todoName)).not.toBeVisible();
  });

  test('should update the item count after deleting a todo', async ({ page }) => {
    const todoName = `Todo to delete count ${Date.now()}`;
    const countLocator = page.getByText(/^\d+ \/ 10 items$/);

    await expect(countLocator).toBeVisible();

    await page.getByPlaceholder("Nom de l'item…").fill(todoName);
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByText(todoName)).toBeVisible();
    const textAfterAdd = await countLocator.textContent();
    const countAfterAdd = parseInt(textAfterAdd ?? '0');

    const todoItem = page.locator('li').filter({ hasText: todoName });
    await todoItem.getByRole('button', { name: 'Supprimer' }).click();

    await expect(countLocator).toHaveText(`${countAfterAdd - 1} / 10 items`);
  });

  // ─── Multiple todos ───────────────────────────────────────────────────────

  test('should display multiple added todos', async ({ page }) => {
    const ts = Date.now();
    const todos = [`First ${ts}`, `Second ${ts + 1}`, `Third ${ts + 2}`];

    for (const name of todos) {
      await page.getByPlaceholder("Nom de l'item…").fill(name);
      await page.getByRole('button', { name: 'Ajouter' }).click();
      await expect(page.getByText(name)).toBeVisible();
    }
  });

  // ─── Logout ───────────────────────────────────────────────────────────────

  test('should redirect to / after logout', async ({ page }) => {
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
  });
});
