import { test, expect } from '@playwright/test';
import { CreateReportPage } from '../../pages/admin/create-report';
import { setupBasicAuth } from '../../utils/auth';
import { mockReportCreation, mockSpreadsheetImport } from '../../utils/mock-api';

test.describe('レポート作成ページ', () => {
  test.beforeEach(async ({ page }) => {
    await setupBasicAuth(page);
    
    await mockReportCreation(page);
    await mockSpreadsheetImport(page);
  });

  test('ページが正常に読み込まれること', async ({ page }) => {
    const createReportPage = new CreateReportPage(page);
    await createReportPage.goto();
    
    await expect(createReportPage.pageTitle).toBeVisible();
  });
});
