import type { Report } from "@/type";
import { Box, Flex, Steps } from "@chakra-ui/react";
import { type Dispatch, useEffect, useState } from "react";
import { useReportProgressPoll } from "./useReportProgressPolling";

const steps = [
  { id: 1, title: "抽出", description: "データの抽出" },
  { id: 2, title: "埋め込み", description: "埋め込み表現の生成" },
  { id: 3, title: "意見グループ化", description: "意見グループ化の実施" },
  { id: 4, title: "初期ラベリング", description: "初期ラベルの付与" },
  { id: 5, title: "統合ラベリング", description: "ラベルの統合" },
  { id: 6, title: "概要生成", description: "概要の作成" },
  { id: 7, title: "集約", description: "結果の集約" },
  { id: 8, title: "可視化", description: "結果の可視化" },
] as const;

// ステップの定義
const stepKeys = [
  "extraction",
  "embedding",
  "hierarchical_clustering",
  "hierarchical_initial_labelling",
  "hierarchical_merge_labelling",
  "hierarchical_overview",
  "hierarchical_aggregation",
  "hierarchical_visualization",
];

type Props = {
  slug: string;
  setReports: Dispatch<React.SetStateAction<Report[] | undefined>>;
};

export const ProgressSteps = ({ slug, setReports }: Props) => {
  const { progress } = useReportProgressPoll(slug);
  const [lastProgress, setLastProgress] = useState<string | null>(null);

  const currentStepIndex =
    progress === "completed" ? steps.length : stepKeys.indexOf(progress) === -1 ? 0 : stepKeys.indexOf(progress);

  // progress が変更されたときにレポート状態を更新
  useEffect(() => {
    if ((progress === "completed" || progress === "error") && progress !== lastProgress) {
      setLastProgress(progress);

      (async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASEPATH}/admin/reports`, {
          method: "GET",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (!response.ok) return;
        setReports(await response.json());
      })();
    }
  }, [progress, lastProgress, setReports]);

  return (
    <Box mt={2}>
      <Steps.Root defaultStep={currentStepIndex} count={steps.length}>
        <Steps.List>
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;

            const stepColor = (() => {
              if (progress === "error" && index === currentStepIndex) {
                return "red.500";
              }
              if (isCompleted) return "green.500";
              return "gray.300";
            })();

            return (
              <Steps.Item key={step.id} index={index} title={step.title}>
                <Flex direction="column" align="center">
                  <Steps.Indicator boxSize="24px" bg={stepColor} position="relative" />
                  <Steps.Title
                    mt={1}
                    fontSize="sm"
                    whiteSpace="nowrap"
                    textAlign="center"
                    color={stepColor}
                    fontWeight={progress === "error" && index === currentStepIndex ? "bold" : "normal"}
                  >
                    {step.title}
                  </Steps.Title>
                </Flex>
                <Steps.Separator borderColor={stepColor} />
              </Steps.Item>
            );
          })}
        </Steps.List>
      </Steps.Root>
    </Box>
  );
};
