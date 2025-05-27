export type Meta = {
  isDefault: boolean; // デフォルトのメタデータかどうか
  reporter: string; // レポート作成者名
  message: string; // レポート作成者からのメッセージ
  webLink?: string; // レポート作成者URL
  privacyLink?: string; // プライバシーポリシーURL
  termsLink?: string; // 利用規約URL
  brandColor?: string; // ブランドカラー
};

export enum ReportVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  UNLISTED = "unlisted",
}

export type Report = {
  slug: string;
  status: string;
  title: string;
  description: string;
  isPubcom: boolean;
  visibility: ReportVisibility;
  createdAt?: string; // 作成日時（ISO形式の文字列）
};

export type Result = {
  arguments: any[]; // 抽出された意見のリスト
  clusters: any[]; // クラスタ情報
  comments: any; // コメント情報
  // biome-ignore lint/suspicious/noExplicitAny:
  propertyMap: Record<string, any>; // プロパティマッピング情報
  // biome-ignore lint/suspicious/noExplicitAny:
  translations: Record<string, any>; // 翻訳情報
  overview: string; // 解析概要
  config: any; // 設定情報
  comment_num: number; // コメント数
  filteredArgumentIds?: string[]; // フィルターに一致した引数IDのリスト（グレーアウト表示の制御に使用）
  visibility?: ReportVisibility; // レポートの可視性設定
};
