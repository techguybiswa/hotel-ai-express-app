import { RunnableConfig } from "./config.js";
export declare function isIterator(thing: unknown): thing is IterableIterator<unknown>;
export declare function isAsyncIterable(thing: unknown): thing is AsyncIterable<unknown>;
export declare function consumeIteratorInContext<T>(context: Partial<RunnableConfig> | undefined, iter: IterableIterator<T>): IterableIterator<T>;
export declare function consumeAsyncIterableInContext<T>(context: Partial<RunnableConfig> | undefined, iter: AsyncIterable<T>): AsyncIterableIterator<T>;
