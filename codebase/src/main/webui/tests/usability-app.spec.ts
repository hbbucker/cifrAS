import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Avaliação de Usabilidade e Acessibilidade (Área Logada)', () => {
  // Aumentar o timeout global deste teste para permitir login manual
  test.setTimeout(120000); 

  test('Deve garantir padrões de acessibilidade nas páginas principais após login', async ({ page }) => {
    // Pula o teste em ambiente de CI (GitHub Actions) pois exige login manual no Google
    test.skip(!!process.env.CI, 'Teste requer login manual e não pode rodar no CI');
    
    // 1. Navega até a página de login
    await page.goto('/login');

    // 2. Aguarda o usuário fazer o login manualmente e ser redirecionado para o dashboard
    // Exibimos uma mensagem no console para guiar o usuário
    console.log('--- POR FAVOR, REALIZE O LOGIN NO NAVEGADOR QUE SE ABRIU ---');
    console.log('Aguardando navegação para o /dashboard...');
    
    await page.waitForURL('**/dashboard', { timeout: 110000 });
    console.log('Login detectado! Iniciando testes de usabilidade...');

    // 3. Testa Dashboard
    let accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    console.log('Violações Dashboard:', accessibilityScanResults.violations);
    expect(accessibilityScanResults.violations).toEqual([]); 

    // 4. Testa Cifras (Songs)
    await page.goto('/songs');
    await page.waitForLoadState('networkidle');
    accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    console.log('Violações Songs:', accessibilityScanResults.violations);
    expect(accessibilityScanResults.violations).toEqual([]);

    // 5. Testa Grupos
    await page.goto('/groups');
    await page.waitForLoadState('networkidle');
    accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    console.log('Violações Grupos:', accessibilityScanResults.violations);
    expect(accessibilityScanResults.violations).toEqual([]);

    // Mantenha o navegador aberto um pouco para o usuário ver
    await page.waitForTimeout(3000);
  });
});
