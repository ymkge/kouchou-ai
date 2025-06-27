import { getApiBaseUrl } from "@/app/utils/api";

type VerificationResult = {
  success: boolean;
  message: string;
  use_azure: boolean;
  available_models?: string[];
  error_type?: string;
  error_detail?: string;
};

export const verifyChatGptApiKey = async (): Promise<VerificationResult | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/admin/environment/verify-chatgpt`, {
      method: "GET",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        "Content-Type": "application/json",
      },
    });

    return await response.json() as VerificationResult;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return null;
  }
};
