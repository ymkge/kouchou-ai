import { Tooltip } from "@/components/ui/tooltip";
import type { Report } from "@/type";
import { Flex, IconButton, Link, Text } from "@chakra-ui/react";
import { LinkIcon } from "lucide-react";
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
        <>
          <Tooltip showArrow content={<Text textStyle="body/sm/bold">{report.title}</Text>} disabled={!isOverflown}>
            <Link
              w="calc(100% - 44px - 8px)"
              href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`}
              target="_blank"
              _hover={{ color: "font.link" }}
            >
              <Text textStyle="body/md/bold" truncate ref={ref}>
                {report.title}
              </Text>
            </Link>
          </Tooltip>
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
