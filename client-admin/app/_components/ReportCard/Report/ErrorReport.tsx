import type { Report } from "@/type";
import { GridItem, HStack, Text } from "@chakra-ui/react";
import { Bot } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { DeleteButton } from "../DeleteButton";
import { ProgressSteps } from "../ProgressSteps/ProgressSteps";
import { ReportCreatedAt } from "../ReportCreatedAt";
import { ReportTtile } from "../ReportTitle";

type Props = {
  report: Report;
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function ErrorReport({ report, setReports }: Props) {
  return (
    <>
      <GridItem>
        <ReportCreatedAt createdAt={report.createdAt} />
      </GridItem>
      <GridItem ml="2">
        <ReportTtile report={report} />
      </GridItem>
      <GridItem gridColumn="span 6" ml="2">
        <HStack color="font.error">
          <Bot />
          <Text textStyle="body/sm/bold">エラーが発生しました。レポート生成設定を調整してください。</Text>
        </HStack>
      </GridItem>
      <GridItem>
        <DeleteButton report={report} />
      </GridItem>
      <GridItem gridColumn="span 9" mt="3">
        <ProgressSteps slug={report.slug} setReports={setReports} />
      </GridItem>
    </>
  );
}
