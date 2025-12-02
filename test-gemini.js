const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyA-3CtXwi624G-i3gyuH4isT1r6N-2iq0I";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        console.log("Testing gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with pro:", result.response.text());
    } catch (error) {
        console.error("Error with pro:", error.message);
    }
}

run();
