# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: google-drive-import.spec.ts >> Google Drive Import >> Should import song from Google Drive successfully
- Location: tests/google-drive-import.spec.ts:31:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Select Document from Google Drive')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Select Document from Google Drive')

```

```yaml
- complementary:
  - text: CifrAS
  - button "Collapse sidebar" [expanded]
  - navigation "Main sidebar navigation":
    - link "Home":
      - /url: /dashboard
    - link "Playlists":
      - /url: /playlists
    - link "Groups":
      - /url: /groups
    - link "Shared":
      - /url: /shared
    - link "Settings":
      - /url: /settings
  - button "User menu": t
- main:
  - button
  - heading "New Song" [level=1]
  - button "Save"
  - text: Title
  - textbox
  - text: Artist
  - textbox
  - text: Key Signature
  - textbox: C
  - text: Chords & Lyrics
  - button "Import from Google Drive"
  - paragraph: Write chords above words or use [Chord] brackets inline.
  - textbox "[C]Hello [G]world..."
- heading "Selecione o Documento do Drive" [level=2]
- button
- paragraph: Sua conta não está conectada ao Google Drive.
- button "Conectar ao Google Drive"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Google Drive Import', () => {
  4  |   test.beforeEach(async ({ page, context }) => {
  5  |     // Set English language for consistent E2E text matching
  6  |     await context.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  7  | 
  8  |     // Mock Auth
  9  |     await page.route('**/api/integrations/google/auth-url', async (route) => {
  10 |       await route.fulfill({ json: { url: 'https://mock-google-auth.com' } });
  11 |     });
  12 | 
  13 |     // Mock Files List
  14 |     await page.route('**/api/integrations/google/drive/files', async (route) => {
  15 |       await route.fulfill({
  16 |         json: [
  17 |           { id: '123', name: 'My Worship Song.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  18 |           { id: '456', name: 'Another Song.doc', mimeType: 'application/msword' }
  19 |         ]
  20 |       });
  21 |     });
  22 | 
  23 |     // Mock Extract Text
  24 |     await page.route('**/api/integrations/google/drive/extract-text/123', async (route) => {
  25 |       await route.fulfill({
  26 |         json: { text: '[C]This is the [G]extracted text\n[Am]From Google [F]Drive!' }
  27 |       });
  28 |     });
  29 |   });
  30 | 
  31 |   test('Should import song from Google Drive successfully', async ({ page }) => {
  32 |     // 1. Perform UI Login
  33 |     const testEmail = process.env.E2E_USER || `test_${Date.now()}@example.com`;
  34 |     const testPassword = process.env.E2E_PASSWORD || 'password123';
  35 | 
  36 |     // Register first if needed
  37 |     if (!process.env.E2E_USER) {
  38 |       await page.goto('/register');
  39 |       await page.getByTestId('name-input').fill('Test User');
  40 |       await page.getByTestId('reg-email-input').fill(testEmail);
  41 |       await page.getByTestId('reg-password-input').fill(testPassword);
  42 |       await page.getByTestId('reg-confirm-password-input').fill(testPassword);
  43 |       await page.getByTestId('register-btn').click();
  44 |       
  45 |       try {
  46 |         await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  47 |       } catch {
  48 |         // ignore
  49 |       }
  50 |     }
  51 | 
  52 |     await page.goto('/login');
  53 |     await page.getByTestId('email-input').fill(testEmail);
  54 |     await page.getByTestId('password-input').fill(testPassword);
  55 |     await page.getByTestId('login-btn').click();
  56 | 
  57 |     await expect(page).toHaveURL(/.*\/dashboard/);
  58 | 
  59 |     // 2. Go to New Song
  60 |     await page.goto('/songs/new');
  61 |     
  62 |     // Expect the page to be loaded
  63 |     await expect(page.getByText('Chords & Lyrics')).toBeVisible();
  64 | 
  65 |     // Click on the Import from Google Drive button
  66 |     const importBtn = page.getByTestId('btn-open-drive-picker');
  67 |     await expect(importBtn).toBeVisible();
  68 |     await importBtn.click();
  69 | 
  70 |     // Verify modal opens
  71 |     const modalHeading = page.getByText('Select Document from Google Drive');
> 72 |     await expect(modalHeading).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  73 | 
  74 |     // Verify mocked files are listed
  75 |     await expect(page.getByText('My Worship Song.docx')).toBeVisible();
  76 |     await expect(page.getByText('Another Song.doc')).toBeVisible();
  77 | 
  78 |     // Click on the first file
  79 |     await page.getByText('My Worship Song.docx').click();
  80 | 
  81 |     // Wait for the modal to close and text to be imported
  82 |     await expect(modalHeading).toBeHidden();
  83 |     
  84 |     // Verify the text was inserted into the textarea
  85 |     const textarea = page.getByTestId('song-content-input');
  86 |     await expect(textarea).toHaveValue('[C]This is the [G]extracted text\n[Am]From Google [F]Drive!');
  87 | 
  88 |     // Wait for the success toast
  89 |     await expect(page.getByText('Text imported successfully. Please review the chords and lyrics.')).toBeVisible();
  90 |   });
  91 | });
  92 | 
```