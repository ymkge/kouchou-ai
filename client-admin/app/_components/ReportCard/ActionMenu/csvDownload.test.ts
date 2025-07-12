import { getApiBaseUrl } from "../../../utils/api";
import { csvDownload } from "./csvDownload";

// Mock API関数
jest.mock("../../../utils/api", () => ({
  getApiBaseUrl: jest.fn(),
}));

const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>;

describe("csvDownload", () => {
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

  it("CSVダウンロードが正常に実行され、適切なデータを返す", async () => {
    const mockData = "test,data\n1,2";
    const mockArrayBuffer = Buffer.from(mockData).buffer;
    const mockBlob = {
      arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const result = await csvDownload("test-slug");

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/admin/comments/test-slug/csv", {
      headers: {
        "x-api-key": "test-api-key",
        "Content-Type": "application/json",
      },
    });

    expect(result).toEqual({
      data: expect.any(Buffer),
      filename: "kouchou_test-slug.csv",
      contentType: "text/csv",
    });
    expect(mockBlob.arrayBuffer).toHaveBeenCalled();
  });

  it("APIエラーの場合、適切にエラーをthrowする", async () => {
    const errorDetail = "データが見つかりません";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: errorDetail }),
    });

    await expect(csvDownload("test-slug")).rejects.toThrow(errorDetail);
  });

  it("APIエラーでdetailが無い場合、デフォルトエラーメッセージをthrowする", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(csvDownload("test-slug")).rejects.toThrow("CSV ダウンロードに失敗しました");
  });

  it("ネットワークエラーの場合、適切にエラーをthrowする", async () => {
    const networkError = new Error("Network error");

    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(csvDownload("test-slug")).rejects.toThrow(networkError);
  });
});
