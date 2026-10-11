import { getApiUrl } from "./api-url";

interface NotificationData {
  formType: "naming" | "courtship";
  formId: string;
  churchZone: string;
  formData: any;
}

export async function sendFormNotifications(data: NotificationData) {
  try {
    const response = await fetch(
      `${getApiUrl()}/api/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to send notifications:", error);
    throw error;
  }
}

export function generateFormId(formType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${formType}_${timestamp}_${random}`;
}
