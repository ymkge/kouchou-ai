import type { Report } from "@/type";
import { Flex, IconButton, Link, Text } from "@chakra-ui/react";
import { LinkIcon } from "lucide-react";

type Props = {
  report: Report;
};

export function ReportTtile({ report }: Props) {
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="2">
      {report.status === "ready" ? (
        <>
          <Link
            w="calc(100% - 44px - 8px)"
            href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`}
            target="_blank"
            _hover={{ color: "font.link" }}
          >
            <Text textStyle="body/md/bold" truncate>
              {report.title}
            </Text>
          </Link>
          <Link href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`} target="_blank">
            <IconButton variant="ghost" size="lg" _hover={{ bg: "blue.50", boxShadow: "none" }}>
              <LinkIcon />
            </IconButton>
          </Link>
        </>
      ) : (
        <Text textStyle="body/md/bold" truncate>
          {report.title}
        </Text>
      )}
    </Flex>
  );
}
