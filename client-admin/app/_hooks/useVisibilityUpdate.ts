import type { Report } from "@/type";
import type { Dispatch, SetStateAction } from "react";
import { getApiBaseUrl } from "../utils/api";
import { createListCollection } from "@chakra-ui/react";

export const visibilityOptions = createListCollection({
  items: [
    { label: "公開", value: "public" },
    { label: "限定公開", value: "unlisted" },
    { label: "非公開", value: "private" },
  ],
});

type Props = {
  slug: string;
  visibility: string;
  reports?: Report[];
  setReports: Dispatch<SetStateAction<Report[] | undefined>>;
};

export const useVisibilityUpdate = async ({ slug, visibility, reports, setReports }: Props) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/admin/reports/${slug}/visibility`, {
      method: "PATCH",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "公開状態の変更に失敗しました");
    }

    const data = await response.json();
    const updatedReports = reports?.map((r) => (r.slug === slug ? { ...r, visibility: data.visibility } : r));
    setReports(updatedReports);
  } catch (error) {
    console.error(error);
  }
};
