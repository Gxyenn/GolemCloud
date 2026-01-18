import { Message, FileAttachment } from "../types";

export async function getGeminiResponse(
  prompt: string,
  history: Message[],
  attachments: FileAttachment[] = []
): Promise<string> {

  const contents = history.map(msg => {
    const parts: any[] = [];

    if (msg.attachments?.length) {
      msg.attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.type,
            data: att.data
          }
        });
      });
    }

    if (msg.text) {
      parts.push({ text: msg.text });
    }

    return {
      role: msg.role,
      parts
    };
  });

  const res = await fetch("/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents })
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || "Failed to get Gemini response");
  }

  return data.text;
}