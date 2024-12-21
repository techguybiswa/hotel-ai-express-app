import { Tool } from "../../../tools/base.js";
import { VectorStore } from "../../../vectorstores/base.js";
import { Toolkit } from "../base.js";
import { BaseLanguageModel } from "../../../base_language/index.js";
import { ZeroShotCreatePromptArgs } from "../../mrkl/index.js";
import { AgentExecutor } from "../../executor.js";
/**
 * Interface that defines the information about a vector store, including
 * the vector store itself, its name, and description.
 */
export interface VectorStoreInfo {
    vectorStore: VectorStore;
    name: string;
    description: string;
}
/**
 * Class representing a toolkit for working with a single vector store. It
 * initializes the vector store QA tool based on the provided vector store
 * information and language model.
 * @example
 * ```typescript
 * const toolkit = new VectorStoreToolkit(
 *   {
 *     name: "state_of_union_address",
 *     description: "the most recent state of the Union address",
 *     vectorStore: new HNSWLib(),
 *   },
 *   new ChatOpenAI({ temperature: 0 }),
 * );
 * const result = await toolkit.invoke({
 *   input:
 *     "What did biden say about Ketanji Brown Jackson in the state of the union address?",
 * });
 * console.log(`Got output ${result.output}`);
 * ```
 */
export declare class VectorStoreToolkit extends Toolkit {
    tools: Tool[];
    llm: BaseLanguageModel;
    constructor(vectorStoreInfo: VectorStoreInfo, llm: BaseLanguageModel);
}
/**
 * Class representing a toolkit for working with multiple vector stores.
 * It initializes multiple vector store QA tools based on the provided
 * vector store information and language model.
 */
export declare class VectorStoreRouterToolkit extends Toolkit {
    tools: Tool[];
    vectorStoreInfos: VectorStoreInfo[];
    llm: BaseLanguageModel;
    constructor(vectorStoreInfos: VectorStoreInfo[], llm: BaseLanguageModel);
}
export declare function createVectorStoreAgent(llm: BaseLanguageModel, toolkit: VectorStoreToolkit, args?: ZeroShotCreatePromptArgs): AgentExecutor;
export declare function createVectorStoreRouterAgent(llm: BaseLanguageModel, toolkit: VectorStoreRouterToolkit, args?: ZeroShotCreatePromptArgs): AgentExecutor;
