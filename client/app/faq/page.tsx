import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { Meta } from "@/type";
import { getApiBaseUrl } from "../utils/api";
import { Box } from "@chakra-ui/react";
import Faq from "./Faq";
import Contact from "./Contact";

export default async function Page() {
  const metaResponse = await fetch(`${getApiBaseUrl()}/meta/metadata.json`, {
    next: { tags: ["meta"] },
  });
  const meta: Meta = await metaResponse.json();

  return (
    <>
      <Header />
      <Box className={"container"} bg="#EFF6FF" pb="24">
        <Faq />
        <Contact />
      </Box>
      <Footer meta={meta} />
    </>
  );
}
