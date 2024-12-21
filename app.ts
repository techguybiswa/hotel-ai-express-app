// @ts-nocheck

import express from "express";
import * as fs from "fs";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";

// Function to process the documents
const formatDocumentsAsString = (documents: Document[]) => {
  return documents.map((document) => document.pageContent).join("\n\n");
};

// Variables to store embeddings and vectorStore to ensure it's only created once
let vectorStore: MemoryVectorStore | null = null;

async function initializeChain(question: string) {
  console.log("Initializing chain for question:", question);
  console.log("Generating embeddings and creating vector store...");
  const model = new ChatOpenAI({
    model: "gpt-4o",
  });

  const text = fs.readFileSync("westin_rulebook.txt", "utf8");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  const docs = await textSplitter.createDocuments([text]);
  console.log("Documents read and split into chunks:", docs.length);

  // Create a vector store from the documents
  vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings() as unknown as Embeddings
  );
  console.log("Vector embeddings generated", vectorStore);

  // Create the retriever for the vector store
  const vectorStoreRetriever = vectorStore.asRetriever();

  // Create system prompt for the chat model
  const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    ----------------
    {context}`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    {
      context: vectorStoreRetriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  // Answer to the question
  const answer = await chain.invoke(question);
  console.log("Answer generated:", answer);
  return answer;
}

const app = express();
const port = 3000;

// Middleware to log the request details
app.use((req, res, next) => {
  console.log(`Received request - Method: ${req.method}, Path: ${req.path}`);
  next();
});
app.use(express.json()); // Middleware to parse JSON request bodies

// Express route to handle the request with a dynamic question
app.post("/api/ask", async (req, res) => {
  const { question } = req.body; // Extract 'question' from request body

  if (!question || typeof question !== "string") {
    return res
      .status(400)
      .send({ error: "Invalid or missing 'question' parameter" });
  }

  try {
    console.log("Received question:", question);
    const answer = await initializeChain(question); // Process the question
    res.json({ answer }); // Send the result as a JSON response
  } catch (error) {
    console.error("Error processing request:", error);
    res
      .status(500)
      .send({ error: "An error occurred while processing your request." });
  }
});

app.listen(port, () => {
  console.log(`Express server is running at http://localhost:${port}`);
});

// http://localhost:3000/question?question=What%20is%20the%20check%20in%20time%3F
