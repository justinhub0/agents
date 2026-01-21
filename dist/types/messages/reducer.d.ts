import { BaseMessage, BaseMessageLike } from '@langchain/core/messages';
export declare const REMOVE_ALL_MESSAGES = "__remove_all__";
export type Messages = Array<BaseMessage | BaseMessageLike> | BaseMessage | BaseMessageLike;
/**
 * Prebuilt reducer that combines returned messages.
 * Can handle standard messages and special modifiers like {@link RemoveMessage}
 * instances.
 */
export declare function messagesStateReducer(left: Messages, right: Messages): BaseMessage[];
