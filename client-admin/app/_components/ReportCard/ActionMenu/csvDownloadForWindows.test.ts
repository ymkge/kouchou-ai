import { getApiBaseUrl } from "../../../utils/api";
import { csvDownloadForWindows } from "./csvDownloadForWindows";

// Mock API関数
jest.mock("../../../utils/api", () => ({
  getApiBaseUrl: jest.fn(),
}));

const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>;

describe("csvDownloadForWindows", () => {
  beforeEach(() => {
    // fetchのモック
    global.fetch = jest.fn();

    // APIベースURLのモック
    mockGetApiBaseUrl.mockReturnValue("http://localhost:8000");

    // 環境変数のモック
    process.env.NEXT_PUBLIC_ADMIN_API_KEY = "test-api-key";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Windows用CSVダウンロードが正常に実行され、適切なデータを返す", async () => {
    const mockCsvText = "test,data\n値1,値2";
    const mockBlob = {
      text: jest.fn().mockResolvedValue(mockCsvText),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const result = await csvDownloadForWindows("test-slug");

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/admin/comments/test-slug/csv", {
      headers: {
        "x-api-key": "test-api-key",
        "Content-Type": "application/json",
      },
    });

    expect(mockBlob.text).toHaveBeenCalled();
    expect(result).toEqual({
      data: expect.any(Buffer),
      filename: "kouchou_test-slug_excel.csv",
      contentType: "text/csv;charset=utf-8",
    });

    // BOMが含まれていることを確認
    const expectedContent = `\uFEFF${mockCsvText}`;
    const actualContent = result.data.toString("utf-8");
    expect(actualContent).toBe(expectedContent);
  });

  it("APIエラーの場合、適切にエラーをthrowする", async () => {
    const errorDetail = "データが見つかりません";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: errorDetail }),
    });

    await expect(csvDownloadForWindows("test-slug")).rejects.toThrow(errorDetail);
  });

  it("APIエラーでdetailが無い場合、デフォルトエラーメッセージをthrowする", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(csvDownloadForWindows("test-slug")).rejects.toThrow("CSV ダウンロードに失敗しました");
  });

  it("ネットワークエラーの場合、適切にエラーをthrowする", async () => {
    const networkError = new Error("Network error");

    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(csvDownloadForWindows("test-slug")).rejects.toThrow(networkError);
  });
});
