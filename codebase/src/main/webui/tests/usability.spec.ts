import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('feature_discovery_02_seen', 'true');
  });
});

const TARGET_URL = 'http://localhost:8080'; 

test.describe('Avaliação de Usabilidade e Acessibilidade no Contexto CifrAS', () => {
  test('Deve garantir padrões básicos de acessibilidade (a11y) na Landing Page', async ({ page }) => {
    // 1. Navega até a página
    await page.goto(TARGET_URL);

    // 2. Executa a validação de regras de acessibilidade e usabilidade básicas
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // 3. O teste falhará se houver violações graves (contraste, labels ausentes, etc.)
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Deve renderizar os elementos vitais na tela de forma responsiva', async ({ page }) => {
    await page.goto(TARGET_URL);
    
    // Testa se o elemento principal da página carrega rapidamente e está visível
    const tituloPrincipal = page.locator('h1');
    await expect(tituloPrincipal).toBeVisible({ timeout: 5000 });
  });
});


