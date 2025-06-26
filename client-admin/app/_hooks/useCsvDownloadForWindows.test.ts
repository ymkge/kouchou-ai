import { getApiBaseUrl } from "../utils/api";
import { useCsvDownloadForWindows } from "./useCsvDownloadForWindows";

// Mock API関数
jest.mock("../utils/api", () => ({
  getApiBaseUrl: jest.fn(),
}));

const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>;

describe("useCsvDownloadForWindows", () => {
  beforeEach(() => {
    // fetchのモック
    global.fetch = jest.fn();
    // URLオブジェクトのモック
    global.URL.createObjectURL = jest.fn(() => "mocked-blob-url");
    global.URL.revokeObjectURL = jest.fn();
    // documentのモック
    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    };
    document.createElement = jest.fn(() => mockLink as unknown as HTMLAnchorElement);

    // APIベースURLのモック
    mockGetApiBaseUrl.mockReturnValue("http://localhost:8000");

    // 環境変数のモック
    process.env.NEXT_PUBLIC_ADMIN_API_KEY = "test-api-key";

    // console.errorのモック
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Windows用CSVダウンロードが正常に実行される", async () => {
    const mockCsvText = "test,data\n値1,値2";
    const mockBlob = {
      text: () => Promise.resolve(mockCsvText),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const mockBomBlob = new Blob(["test-bom-content"]);
    global.Blob = jest.fn(() => mockBomBlob) as unknown as typeof Blob;

    await useCsvDownloadForWindows("test-slug");

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/admin/comments/test-slug/csv", {
      headers: {
        "x-api-key": "test-api-key",
        "Content-Type": "application/json",
      },
    });

    expect(global.Blob).toHaveBeenCalledWith([`\uFEFF${mockCsvText}`], {
      type: "text/csv;charset=utf-8",
    });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBomBlob);
    expect(document.createElement).toHaveBeenCalledWith("a");

    const mockLink = document.createElement("a");
    expect(mockLink.href).toBe("mocked-blob-url");
    expect(mockLink.download).toBe("kouchou_test-slug_excel.csv");
    expect(mockLink.click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mocked-blob-url");
  });

  it("APIエラーの場合、適切にエラーハンドリングされる", async () => {
    const errorDetail = "データが見つかりません";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: errorDetail }),
    });

    await useCsvDownloadForWindows("test-slug");

    expect(console.error).toHaveBeenCalledWith(new Error(errorDetail));
  });

  it("APIエラーでdetailが無い場合、デフォルトエラーメッセージが使用される", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await useCsvDownloadForWindows("test-slug");

    expect(console.error).toHaveBeenCalledWith(new Error("CSV ダウンロードに失敗しました"));
  });

  it("ネットワークエラーの場合、適切にエラーハンドリングされる", async () => {
    const networkError = new Error("Network error");

    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await useCsvDownloadForWindows("test-slug");

    expect(console.error).toHaveBeenCalledWith(networkError);
  });

  it("Blobの作成に失敗した場合、適切にエラーハンドリングされる", async () => {
    const blobError = new Error("Blob creation failed");

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.reject(blobError),
    });

    await useCsvDownloadForWindows("test-slug");

    expect(console.error).toHaveBeenCalledWith(blobError);
  });

  it("テキスト取得に失敗した場合、適切にエラーハンドリングされる", async () => {
    const textError = new Error("Text extraction failed");
    const mockBlob = {
      text: () => Promise.reject(textError),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    await useCsvDownloadForWindows("test-slug");

    expect(console.error).toHaveBeenCalledWith(textError);
  });
});
