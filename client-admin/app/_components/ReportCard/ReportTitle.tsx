import { Tooltip } from "@/components/ui/tooltip";
import type { Report } from "@/type";
import { Flex, Link, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  report: Report;
};

export function ReportTtile({ report }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isOverflown, setIsOverflown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    setIsOverflown(element ? element.scrollWidth > element.clientWidth : false);
  }, []);

  return (
    <Flex alignItems="center" justifyContent="space-between" gap="2">
      {report.status === "ready" ? (
        <Tooltip showArrow content={<Text textStyle="body/sm/bold">{report.title}</Text>} disabled={!isOverflown}>
          <Link
            w="100%"
            href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`}
            target="_blank"
            _hover={{ color: "font.link" }}
          >
            <Text ref={ref} textStyle="body/md/bold" truncate>
              {report.title}
            </Text>
          </Link>
        </Tooltip>
      ) : (
        <Tooltip showArrow content={<Text textStyle="body/sm/bold">{report.title}</Text>} disabled={!isOverflown}>
          <Text ref={ref} textStyle="body/md/bold" truncate>
            {report.title}
          </Text>
        </Tooltip>
      )}
    </Flex>
  );
}
