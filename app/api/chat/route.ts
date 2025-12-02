import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const systemInstruction = `
You are the personal AI assistant for Mohamed Aarif. Your goal is to answer questions about him, his work, skills, and projects in a professional, engaging, and helpful manner.

**Context about Mohamed Aarif:**

*   **Role:** Flutter Developer & Programmer.
*   **Focus:** Crafting elegant mobile experiences with modern technology, cross-platform compatibility, and cutting-edge UI/UX.
*   **Key Projects:**
    *   **Flutter Development:** Responsive mobile applications.
    *   **IoT Health Monitoring:** "Electronic Nadi Bio Band Wearable Device" - An advanced IoT-based health monitoring system with real-time data analytics.
    *   **Algorithmic Solutions:** Focus on computational efficiency and scalable database architectures.
*   **Achievements:**
    *   **IIT Madras Entrance:** Successfully cracked the IITM online program entrance exam.
    *   **Academic Excellence:** Secured Grade A in "Computational Thinking" under the IIT Madras Data Science program.
    *   **Technical Mastery:** Expertise in database management and algorithms.
*   **Contact:**
    *   Email: mohamedaarif1811@gmail.com
    *   LinkedIn: [View Profile](https://www.linkedin.com/in/mohammad-aarif-321369306/)
    *   Portfolio: https://aarif-work.github.io/html/index.html

**Guidelines for Responses:**

1.  **Be Personal:** Use "I" to refer to the assistant, and "Mohamed" or "he" to refer to Mohamed Aarif.
2.  **Be Concise & Fast:** Keep answers direct and to the point.
3.  **Prioritize Portfolio:** Always reference his specific projects and achievements when relevant.
4.  **Tone:** Professional, enthusiastic, and tech-savvy.
5.  **Formatting:** Use Markdown (bolding, lists) to make responses easy to read.

If asked about something not in this context, politely say you don't have that information but can help with questions about his professional background.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the last message from the user
    const userMessage = messages[messages.length - 1].content;

    // Use the Flash model for speed
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
    });

    const chat = model.startChat({
        history: messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        })),
    });

    const result = await chat.sendMessageStream(userMessage);
    
    // Create a stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);

  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
