import type { Report } from "@/type";
import { Box, Center, Steps } from "@chakra-ui/react";
import { Check, TriangleAlert } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { Processing } from "./Processing";
import { useReportProgressPoll } from "./useReportProgressPolling";

const steps = [
  { title: "抽出", key: "extraction" },
  { title: "埋め込み", key: "embedding" },
  { title: "意見グループ化", key: "hierarchical_clustering" },
  { title: "初期ラベリング", key: "hierarchical_initial_labelling" },
  { title: "統合ラベリング", key: "hierarchical_merge_labelling" },
  { title: "概要生成", key: "hierarchical_overview" },
  { title: "集約", key: "hierarchical_aggregation" },
  { title: "可視化", key: "hierarchical_visualization" },
] as const;

export const stepKeys = steps.map(({ key }) => key);

const stepItemstyle = {
  error: {
    completed: "font.error",
    processing: "bg.error",
    currentStepIcon: <TriangleAlert />,
  },
  processing: {
    completed: "font.processing",
    processing: "bg.processing",
    currentStepIcon: <Processing />,
  },
} as const;

type Props = {
  slug: string;
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export const ProgressSteps = ({ slug, setReports }: Props) => {
  const { progress, isError } = useReportProgressPoll(slug);
  const [lastProgress, setLastProgress] = useState<string | null>(null);

  const isLoading = progress === "loading";
  const isCompleted = progress === "completed";
  const currentStepIndex = isCompleted ? steps.length : isLoading ? 0 : stepKeys.indexOf(progress);
  const status = isError ? "error" : "processing";

  // レポートが作成完了orエラーになった際に画面を更新する
  useEffect(() => {
    if ((isCompleted || isError) && progress !== lastProgress) {
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
  }, [progress, isCompleted, isError, lastProgress, setReports]);

  return (
    <Steps.Root defaultStep={currentStepIndex} count={steps.length} bg={stepItemstyle[status].processing} mt="2" p="6">
      <Steps.List gap="2">
        {steps.map((step, index) => (
          <Steps.Item key={step.key} index={index} gap="2" flex="auto" textStyle="body/sm">
            {index < currentStepIndex ? (
              <>
                <Center w="6" h="6" bg={stepItemstyle[status].completed} borderRadius="full">
                  <Check size="16" color="white" />
                </Center>
                <Steps.Title textStyle="body/sm" color="font.primary">
                  {step.title}
                </Steps.Title>
              </>
            ) : index === currentStepIndex ? (
              <>
                <Box color={stepItemstyle[status].completed}>{stepItemstyle[status].currentStepIcon}</Box>
                <Steps.Title
                  textStyle={isError ? "body/sm/bold" : "body/sm"}
                  color={isError ? "font.error" : "font.primary"}
                >
                  {step.title}
                </Steps.Title>
              </>
            ) : (
              <>
                <Center w="6" h="6" bg={stepItemstyle[status].completed} opacity="0.16" borderRadius="full" />
                <Steps.Title textStyle="body/sm" color={isError ? "font.secondary" : "font.primary"}>
                  {step.title}
                </Steps.Title>
              </>
            )}
            <Steps.Separator m="0" bg="blackAlpha.500" h="1px" />
          </Steps.Item>
        ))}
      </Steps.List>
    </Steps.Root>
  );
};
