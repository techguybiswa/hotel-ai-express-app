import { AgentAction, AgentFinish, AgentStep, BaseMessage, ChatGeneration } from "../../schema/index.js";
import { AgentActionOutputParser, AgentMultiActionOutputParser } from "../types.js";
/**
 * Type that represents an agent action with an optional message log.
 */
export type FunctionsAgentAction = AgentAction & {
    messageLog?: BaseMessage[];
};
/**
 * @example
 * ```typescript
 *
 * const prompt = ChatPromptTemplate.fromMessages([
 *   ["ai", "You are a helpful assistant"],
 *   ["human", "{input}"],
 *   new MessagesPlaceholder("agent_scratchpad"),
 * ]);
 *
 * const modelWithFunctions = new ChatOpenAI({
 *   modelName: "gpt-4",
 *   temperature: 0,
 * }).bind({
 *   functions: tools.map((tool) => formatToOpenAIFunction(tool)),
 * });
 *
 * const runnableAgent = RunnableSequence.from([
 *   {
 *     input: (i) => i.input,
 *     agent_scratchpad: (i) => formatAgentSteps(i.steps),
 *   },
 *   prompt,
 *   modelWithFunctions,
 *   new OpenAIFunctionsAgentOutputParser(),
 * ]);
 *
 * const result = await runnableAgent.invoke({
 *   input: "What is the weather in New York?",
 *   steps: agentSteps,
 * });
 *
 * ```
 */
export declare class OpenAIFunctionsAgentOutputParser extends AgentActionOutputParser {
    lc_namespace: string[];
    static lc_name(): string;
    parse(text: string): Promise<AgentAction | AgentFinish>;
    parseResult(generations: ChatGeneration[]): Promise<AgentFinish | FunctionsAgentAction>;
    /**
     * Parses the output message into a FunctionsAgentAction or AgentFinish
     * object.
     * @param message The BaseMessage to parse.
     * @returns A FunctionsAgentAction or AgentFinish object.
     */
    parseAIMessage(message: BaseMessage): FunctionsAgentAction | AgentFinish;
    getFormatInstructions(): string;
}
/**
 * Type that represents an agent action with an optional message log.
 */
export type ToolsAgentAction = AgentAction & {
    toolCallId: string;
    messageLog?: BaseMessage[];
};
export type ToolsAgentStep = AgentStep & {
    action: ToolsAgentAction;
};
/**
 * @example
 * ```typescript
 *
 * const prompt = ChatPromptTemplate.fromMessages([
 *   ["ai", "You are a helpful assistant"],
 *   ["human", "{input}"],
 *   new MessagesPlaceholder("agent_scratchpad"),
 * ]);
 *
 * const runnableAgent = RunnableSequence.from([
 *   {
 *     input: (i: { input: string; steps: ToolsAgentStep[] }) => i.input,
 *     agent_scratchpad: (i: { input: string; steps: ToolsAgentStep[] }) =>
 *       formatToOpenAIToolMessages(i.steps),
 *   },
 *   prompt,
 *   new ChatOpenAI({
 *     modelName: "gpt-3.5-turbo-1106",
 *     temperature: 0,
 *   }).bind({ tools: tools.map(formatToOpenAITool) }),
 *   new OpenAIToolsAgentOutputParser(),
 * ]).withConfig({ runName: "OpenAIToolsAgent" });
 *
 * const result = await runnableAgent.invoke({
 *   input:
 *     "What is the sum of the current temperature in San Francisco, New York, and Tokyo?",
 * });
 *
 * ```
 */
export declare class OpenAIToolsAgentOutputParser extends AgentMultiActionOutputParser {
    lc_namespace: string[];
    static lc_name(): string;
    parse(text: string): Promise<AgentAction[] | AgentFinish>;
    parseResult(generations: ChatGeneration[]): Promise<AgentFinish | ToolsAgentAction[]>;
    /**
     * Parses the output message into a ToolsAgentAction[] or AgentFinish
     * object.
     * @param message The BaseMessage to parse.
     * @returns A ToolsAgentAction[] or AgentFinish object.
     */
    parseAIMessage(message: BaseMessage): ToolsAgentAction[] | AgentFinish;
    getFormatInstructions(): string;
}
