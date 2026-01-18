import { Message, FileAttachment } from "../types";

export async function getGeminiResponse(
  prompt: string,
  history: Message[],
  attachments: FileAttachment[] = []
): Promise<string> {

  const messagesToSend = [
    ...history,
    {
      role: 'user',
      content: prompt,
      attachments: attachments // Attachments user saat ini
    }
  ];

  const contents = messagesToSend.map((msg: any) => {
    const parts: any[] = [];

    // Handle Attachments
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach((att: FileAttachment) => {
        parts.push({
          inlineData: {
            mimeType: att.type,
            data: att.data 
          }
        });
      });
    }

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts
    };
  });

  const res = await fetch("/chat", {
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