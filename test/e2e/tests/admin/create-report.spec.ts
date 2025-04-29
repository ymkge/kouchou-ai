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
    await expect(createReportPage.pageTitle).toHaveText('新しいレポートを作成する');
  });

  test('基本的なフォーム要素が存在すること', async ({ page }) => {
    const createReportPage = new CreateReportPage(page);
    await createReportPage.goto();
    
    await expect(createReportPage.inputField).toBeVisible();
    await expect(createReportPage.questionField).toBeVisible();
    await expect(createReportPage.introField).toBeVisible();
    await expect(createReportPage.csvTab).toBeVisible();
    await expect(createReportPage.spreadsheetTab).toBeVisible();
    await expect(createReportPage.submitButton).toBeVisible();
  });

  test('CSVタブとスプレッドシートタブを切り替えられること', async ({ page }) => {
    const createReportPage = new CreateReportPage(page);
    await createReportPage.goto();
    
    await createReportPage.csvTab.click();
    await expect(createReportPage.csvFileUpload).toBeVisible();
    
    await createReportPage.spreadsheetTab.click();
    await expect(createReportPage.spreadsheetUrlInput).toBeVisible();
  });
});
