import type { Report } from "@/type";

export const useAnalysisInfo = (report: Report) => {
  const tokenUsageInput = report.tokenUsageInput?.toLocaleString();
  const tokenUsageOutput = report.tokenUsageOutput?.toLocaleString();
  const tokenUsageTotal = report.tokenUsage?.toLocaleString();
  const estimatedCost = report.estimatedCost?.toFixed(6) || "情報なし";
  const model = report.provider && report.model ? `${report.provider} ${report.model}` : null;

  const hasInput = !!tokenUsageInput && !!tokenUsageOutput;
  const hasTotal = !!tokenUsageTotal;

  if (hasInput) {
    return {
      hasInput,
      hasTotal,
      estimatedCost,
      model,
      tokenUsageInput,
      tokenUsageOutput,
    };
  }

  if (hasTotal) {
    return {
      hasInput,
      hasTotal,
      estimatedCost,
      model,
      tokenUsageTotal: `${tokenUsageTotal} (詳細なし)`,
    };
  }

  return {
    hasInput,
    hasTotal,
    estimatedCost,
    model,
    tokenUsageTotal: "情報なし",
  }
};
