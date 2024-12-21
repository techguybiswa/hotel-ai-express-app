"use strict";
// @ts-nocheck
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const openai_1 = require("@langchain/openai");
const textsplitters_1 = require("@langchain/textsplitters");
const memory_1 = require("langchain/vectorstores/memory");
const runnables_1 = require("@langchain/core/runnables");
const output_parsers_1 = require("@langchain/core/output_parsers");
const prompts_1 = require("@langchain/core/prompts");
// Function to process the documents
const formatDocumentsAsString = (documents) => {
    return documents.map((document) => document.pageContent).join("\n\n");
};
// Variables to store embeddings and vectorStore to ensure it's only created once
let vectorStore = null;
function initializeChain(question) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing chain for question:", question);
        console.log("Generating embeddings and creating vector store...");
        const model = new openai_1.ChatOpenAI({
            model: "gpt-4o",
        });
        const text = fs.readFileSync("westin_rulebook.txt", "utf8");
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });
        const docs = yield textSplitter.createDocuments([text]);
        console.log("Documents read and split into chunks:", docs.length);
        // Create a vector store from the documents
        vectorStore = yield memory_1.MemoryVectorStore.fromDocuments(docs, new openai_1.OpenAIEmbeddings());
        console.log("Vector embeddings generated", vectorStore);
        // Create the retriever for the vector store
        const vectorStoreRetriever = vectorStore.asRetriever();
        // Create system prompt for the chat model
        const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    ----------------
    {context}`;
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            ["human", "{question}"],
        ]);
        const chain = runnables_1.RunnableSequence.from([
            {
                context: vectorStoreRetriever.pipe(formatDocumentsAsString),
                question: new runnables_1.RunnablePassthrough(),
            },
            prompt,
            model,
            new output_parsers_1.StringOutputParser(),
        ]);
        // Answer to the question
        const answer = yield chain.invoke(question);
        console.log("Answer generated:", answer);
        return answer;
    });
}
const app = (0, express_1.default)();
const port = 3000;
// Middleware to log the request details
app.use((req, res, next) => {
    console.log(`Received request - Method: ${req.method}, Path: ${req.path}`);
    next();
});
app.use(express_1.default.json()); // Middleware to parse JSON request bodies
// Express route to handle the request with a dynamic question
app.post("/api/ask", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question } = req.body; // Extract 'question' from request body
    if (!question || typeof question !== "string") {
        return res
            .status(400)
            .send({ error: "Invalid or missing 'question' parameter" });
    }
    try {
        console.log("Received question:", question);
        const answer = yield initializeChain(question); // Process the question
        res.json({ answer }); // Send the result as a JSON response
    }
    catch (error) {
        console.error("Error processing request:", error);
        res
            .status(500)
            .send({ error: "An error occurred while processing your request." });
    }
}));
app.listen(port, () => {
    console.log(`Express server is running at http://localhost:${port}`);
});
// http://localhost:3000/question?question=What%20is%20the%20check%20in%20time%3F
//# sourceMappingURL=app.js.map