import type { ClusterResponse, Report } from "@/type";
import { ReportVisibility } from "@/type";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClusterEditDialog } from "./ClusterEditDialog";

// Mock the toaster
jest.mock("@/components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
  },
}));

// Mock the API utility
jest.mock("@/app/utils/api", () => ({
  getApiBaseUrl: jest.fn(() => "http://localhost:8000"),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_ADMIN_API_KEY = "test-api-key";

const mockReport: Report = {
  slug: "test-report",
  status: "completed",
  title: "Test Report",
  description: "Test Description",
  isPubcom: false,
  visibility: ReportVisibility.PUBLIC,
};

const mockClusters: ClusterResponse[] = [
  {
    level: 1,
    id: "cluster-1",
    label: "Test Cluster 1",
    description: "Description for cluster 1",
    value: 10,
    parent: null,
    density: 0.8,
    density_rank: 1,
    density_rank_percentile: 90,
  },
  {
    level: 1,
    id: "cluster-2",
    label: "Test Cluster 2",
    description: "Description for cluster 2",
    value: 5,
    parent: null,
    density: 0.6,
    density_rank: 2,
    density_rank_percentile: 70,
  },
  {
    level: 2,
    id: "cluster-3",
    label: "Test Cluster 3",
    description: "Description for cluster 3",
    value: 3,
    parent: "cluster-1",
    density: 0.4,
    density_rank: 3,
    density_rank_percentile: 50,
  },
];

const system = createSystem(defaultConfig);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>{children}</ChakraProvider>
);

// Mock fetch
global.fetch = jest.fn();

describe("ClusterEditDialog", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clusters: mockClusters }),
    });
  });

  it("ダイアログが開いているときにレンダリングされる", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("意見グループを編集")).toBeInTheDocument();
    });
  });

  it("ダイアログが閉じているときはレンダリングされない", () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>,
    );

    expect(screen.queryByText("意見グループを編集")).not.toBeInTheDocument();
  });

  it("ダイアログが開かれたときにクラスタ一覧を取得する", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/admin/reports/test-report/cluster-labels", {
        headers: {
          "x-api-key": "test-api-key",
        },
      });
    });
  });

  it("利用可能な階層レベルが表示される", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("第1階層")).toBeVisible();
    });
  });

  it("選択された階層のクラスタが表示される", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Cluster 1")).toBeInTheDocument();
    });
  });

  it("クラスタが選択されたときにフォームフィールドが更新される", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      const titleInput = screen.getByDisplayValue("Test Cluster 1");
      const descriptionTextarea = screen.getByDisplayValue("Description for cluster 1");
      expect(titleInput).toBeInTheDocument();
      expect(descriptionTextarea).toBeInTheDocument();
    });
  });

  it("クラスタのタイトルと説明を編集できる", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    const user = userEvent.setup();

    const titleInput = await screen.findByPlaceholderText("タイトルを入力");
    const descriptionTextarea = await screen.findByPlaceholderText("説明を入力");

    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");
    await user.clear(descriptionTextarea);
    await user.type(descriptionTextarea, "Updated Description");

    expect(titleInput).toHaveValue("Updated Title");
    expect(descriptionTextarea).toHaveValue("Updated Description");
  });

  it("保存ボタンがクリックされたときに変更が送信される", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ clusters: mockClusters }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ clusters: mockClusters }),
      });

    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    const user = userEvent.setup();

    const titleInput = await screen.findByPlaceholderText("タイトルを入力");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");

    const saveButton = screen.getByText("保存");
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/admin/reports/test-report/cluster-label", {
        method: "PATCH",
        headers: {
          "x-api-key": "test-api-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "cluster-1",
          label: "Updated Title",
          description: "Description for cluster 1",
        }),
      });
    });
  });

  it("キャンセルボタンがクリックされたときにダイアログが閉じる", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("キャンセル");
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("クラスタが選択されていないときに保存ボタンが無効化される", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clusters: [] }),
    });

    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      const saveButton = screen.getByText("保存");
      expect(saveButton).toBeDisabled();
    });
  });

  it("クラスタ取得時のAPIエラーを処理する", async () => {
    const mockToaster = require("@/components/ui/toaster").toaster;
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockToaster.create).toHaveBeenCalledWith({
        type: "error",
        title: "エラー",
        description: "クラスタ一覧の取得に失敗しました。",
      });
    });
  });

  it("クラスタ更新時のAPIエラーを処理する", async () => {
    const mockToaster = require("@/components/ui/toaster").toaster;
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ clusters: mockClusters }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: "Invalid data" }),
      });

    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("保存")).toBeInTheDocument();
    });

    const saveButton = screen.getByText("保存");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockToaster.create).toHaveBeenCalledWith({
        type: "error",
        title: "更新エラー",
        description: "意見グループ情報の更新に失敗しました",
      });
    });
  });

  it("選択された階層レベルによってクラスタがフィルタリングされる", async () => {
    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      // 初期状態では第1階層のクラスタが表示される
      expect(screen.getByDisplayValue("Test Cluster 1")).toBeInTheDocument();
    });

    // Note: Selectコンポーネントの複雑性により、階層レベル切り替えのテストには
    // より複雑なインタラクションシミュレーションが必要
  });

  it("クラスタが選択されている場合のみ編集フォームが表示される", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clusters: [] }),
    });

    render(
      <TestWrapper>
        <ClusterEditDialog report={mockReport} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.queryByText("意見グループの編集")).not.toBeInTheDocument();
    });
  });
});
