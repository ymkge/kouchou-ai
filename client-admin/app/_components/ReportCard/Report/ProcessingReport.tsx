import type { Report } from "@/type";
import { GridItem, HStack, Text } from "@chakra-ui/react";
import { Bot } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { ProgressSteps } from "../ProgressSteps/ProgressSteps";
import { ReportCreatedAt } from "../ReportCreatedAt";
import { ReportTtile } from "../ReportTitle";

type Props = {
  report: Report;
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function ProcessingReport({ report, setReports }: Props) {
  return (
    <>
      <GridItem>
        <ReportCreatedAt createdAt={report.createdAt} />
      </GridItem>
      <GridItem ml="2">
        <ReportTtile report={report} />
      </GridItem>
      <GridItem gridColumn="span 7" ml="2">
        <HStack color="font.processing">
          <Bot />
          <Text textStyle="body/sm/bold">AIによるレポート作成中です。完了までしばらくお待ちください。</Text>
        </HStack>
      </GridItem>
      <GridItem gridColumn="span 9" mt="3">
        <ProgressSteps slug={report.slug} setReports={setReports} />
      </GridItem>
    </>
  );
}
