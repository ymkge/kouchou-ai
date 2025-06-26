import { type Report, ReportVisibility } from "@/type";
import { visibilityUpdate } from "./visibilityUpdate";

// Mock getApiBaseUrl
jest.mock("../utils/api", () => ({
  getApiBaseUrl: () => "http://localhost:8000",
}));

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("visibilityUpdate", () => {
  const mockSetReports = jest.fn();
  const mockReports: Report[] = [
    {
      slug: "test-report-1",
      status: "completed",
      title: "Test Report 1",
      description: "This is a test report",
      isPubcom: false,
      visibility: ReportVisibility.PRIVATE,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      slug: "test-report-2",
      status: "completed",
      title: "Test Report 2",
      description: "This is another test report",
      isPubcom: false,
      visibility: ReportVisibility.PUBLIC,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ADMIN_API_KEY = "test-api-key";
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("公開状態の更新が正常に動作する", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ visibility: "public" }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await visibilityUpdate({
      slug: "test-report-1",
      visibility: ReportVisibility.PUBLIC,
      reports: mockReports,
      setReports: mockSetReports,
    });

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/admin/reports/test-report-1/visibility", {
      method: "PATCH",
      headers: {
        "x-api-key": "test-api-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility: "public" }),
    });

    expect(mockSetReports).toHaveBeenCalledWith([
      {
        slug: "test-report-1",
        status: "completed",
        title: "Test Report 1",
        description: "This is a test report",
        isPubcom: false,
        visibility: "public",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        slug: "test-report-2",
        status: "completed",
        title: "Test Report 2",
        description: "This is another test report",
        isPubcom: false,
        visibility: "public",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);
  });

  it("APIエラーレスポンスを適切に処理する", async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({ detail: "Custom error message" }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await visibilityUpdate({
      slug: "test-report-1",
      visibility: ReportVisibility.PUBLIC,
      reports: mockReports,
      setReports: mockSetReports,
    });

    expect(mockConsoleError).toHaveBeenCalledWith(new Error("Custom error message"));
    expect(mockSetReports).not.toHaveBeenCalled();
  });

  it("詳細メッセージのないAPIエラーを適切に処理する", async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await visibilityUpdate({
      slug: "test-report-1",
      visibility: ReportVisibility.PUBLIC,
      reports: mockReports,
      setReports: mockSetReports,
    });

    expect(mockConsoleError).toHaveBeenCalledWith(new Error("公開状態の変更に失敗しました"));
    expect(mockSetReports).not.toHaveBeenCalled();
  });

  it("ネットワークエラーを適切に処理する", async () => {
    const mockError = new Error("Network error");
    mockFetch.mockRejectedValue(mockError);

    await visibilityUpdate({
      slug: "test-report-1",
      visibility: ReportVisibility.PUBLIC,
      reports: mockReports,
      setReports: mockSetReports,
    });

    expect(mockConsoleError).toHaveBeenCalledWith(mockError);
    expect(mockSetReports).not.toHaveBeenCalled();
  });

  it("空のreports配列を適切に処理する", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ visibility: "public" }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await visibilityUpdate({
      slug: "test-report-1",
      visibility: ReportVisibility.PUBLIC,
      reports: undefined,
      setReports: mockSetReports,
    });

    expect(mockSetReports).toHaveBeenCalledWith(undefined);
  });

  it("一致するレポートのみを更新する", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ visibility: "unlisted" }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await visibilityUpdate({
      slug: "test-report-2",
      visibility: ReportVisibility.UNLISTED,
      reports: mockReports,
      setReports: mockSetReports,
    });

    expect(mockSetReports).toHaveBeenCalledWith([
      {
        slug: "test-report-1",
        status: "completed",
        title: "Test Report 1",
        description: "This is a test report",
        isPubcom: false,
        visibility: "private",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        slug: "test-report-2",
        status: "completed",
        title: "Test Report 2",
        description: "This is another test report",
        isPubcom: false,
        visibility: "unlisted",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);
  });
});
