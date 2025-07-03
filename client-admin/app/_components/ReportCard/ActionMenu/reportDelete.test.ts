import { getApiBaseUrl } from "../../../utils/api";
import { reportDelete } from "./reportDelete";

// モック設定
jest.mock("../../../utils/api");
const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>;

// グローバルオブジェクトのモック
const mockConfirm = jest.spyOn(window, "confirm");
const mockAlert = jest.spyOn(window, "alert");
const mockConsoleError = jest.spyOn(console, "error");

// window.location.reloadのモック
Object.defineProperty(window, "location", {
  value: {
    reload: jest.fn(),
  },
  writable: true,
});

// fetchのモック
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("reportDelete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApiBaseUrl.mockReturnValue("http://localhost:8000");
    mockConfirm.mockImplementation(() => true);
    mockAlert.mockImplementation(() => {});
    mockConsoleError.mockImplementation(() => {});
    (window.location.reload as jest.Mock).mockImplementation(() => {});
    process.env.NEXT_PUBLIC_ADMIN_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_ADMIN_API_KEY = undefined;
  });

  it("削除確認でキャンセルした場合、APIを呼び出さない", async () => {
    mockConfirm.mockReturnValue(false);

    await reportDelete("テストレポート", "test-slug");

    expect(mockConfirm).toHaveBeenCalledWith("レポート「テストレポート」を削除してもよろしいですか？");
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("削除が成功した場合、成功メッセージを表示してページをリロードする", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
    } as Response);

    await reportDelete("テストレポート", "test-slug");

    expect(mockConfirm).toHaveBeenCalledWith("レポート「テストレポート」を削除してもよろしいですか？");
    expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/admin/reports/test-slug", {
      method: "DELETE",
      headers: {
        "x-api-key": "test-api-key",
        "Content-Type": "application/json",
      },
    });
    expect(mockAlert).toHaveBeenCalledWith("レポートを削除しました");
    expect(window.location.reload).toHaveBeenCalled();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it("API呼び出しが失敗した場合、エラーメッセージありでエラーログを出力する", async () => {
    const errorDetail = "レポートが見つかりません";
    mockFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ detail: errorDetail }),
    } as unknown as Response);

    await reportDelete("テストレポート", "test-slug");

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/admin/reports/test-slug", {
      method: "DELETE",
      headers: {
        "x-api-key": "test-api-key",
        "Content-Type": "application/json",
      },
    });
    expect(mockAlert).not.toHaveBeenCalled();
    expect(window.location.reload).not.toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith(new Error(errorDetail));
  });

  it("API呼び出しが失敗した場合、エラーメッセージなしでデフォルトエラーログを出力する", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Response);

    await reportDelete("テストレポート", "test-slug");

    expect(mockConsoleError).toHaveBeenCalledWith(new Error("レポートの削除に失敗しました"));
  });

  it("ネットワークエラーが発生した場合、エラーログを出力する", async () => {
    const networkError = new Error("Network error");
    mockFetch.mockRejectedValue(networkError);

    await reportDelete("テストレポート", "test-slug");

    expect(mockConsoleError).toHaveBeenCalledWith(networkError);
    expect(mockAlert).not.toHaveBeenCalled();
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
