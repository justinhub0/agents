import type * as t from '@/types';
import { StandardGraph } from './Graph';
/**
 * MultiAgentGraph extends StandardGraph to support dynamic multi-agent workflows
 * with handoffs, fan-in/fan-out, and other composable patterns.
 *
 * Key behavior:
 * - Agents with ONLY handoff edges: Can dynamically route to any handoff destination
 * - Agents with ONLY direct edges: Always follow their direct edges
 * - Agents with BOTH: Use Command for exclusive routing (handoff OR direct, not both)
 *   - If handoff occurs: Only the handoff destination executes
 *   - If no handoff: Direct edges execute (potentially in parallel)
 *
 * This enables the common pattern where an agent either delegates (handoff)
 * OR continues its workflow (direct edges), but not both simultaneously.
 */
export declare class MultiAgentGraph extends StandardGraph {
    private edges;
    private startingNodes;
    private directEdges;
    private handoffEdges;
    /**
     * Map of agentId to parallel group info.
     * Contains groupId (incrementing number reflecting execution order) for agents in parallel groups.
     * Sequential agents (not in any parallel group) have undefined entry.
     *
     * Example for: researcher -> [analyst1, analyst2, analyst3] -> summarizer
     * - researcher: undefined (sequential, order 0)
     * - analyst1, analyst2, analyst3: { groupId: 1 } (parallel group, order 1)
     * - summarizer: undefined (sequential, order 2)
     */
    private agentParallelGroups;
    constructor(input: t.MultiAgentGraphInput);
    /**
     * Categorize edges into handoff and direct types
     */
    private categorizeEdges;
    /**
     * Analyze graph structure to determine starting nodes and connections
     */
    private analyzeGraph;
    /**
     * Compute parallel groups by traversing the graph in execution order.
     * Assigns incrementing group IDs that reflect the sequential order of execution.
     *
     * For: researcher -> [analyst1, analyst2, analyst3] -> summarizer
     * - researcher: no group (first sequential node)
     * - analyst1, analyst2, analyst3: groupId 1 (first parallel group)
     * - summarizer: no group (next sequential node)
     *
     * This allows frontend to render in order:
     * Row 0: researcher
     * Row 1: [analyst1, analyst2, analyst3] (grouped)
     * Row 2: summarizer
     */
    private computeParallelCapability;
    /**
     * Get the parallel group ID for an agent, if any.
     * Returns undefined if the agent is not part of a parallel group.
     * Group IDs are incrementing numbers reflecting execution order.
     */
    getParallelGroupId(agentId: string): number | undefined;
    /**
     * Override to indicate this is a multi-agent graph.
     * Enables agentId to be included in RunStep for frontend agent labeling.
     */
    protected isMultiAgentGraph(): boolean;
    /**
     * Override base class method to provide parallel group IDs for run steps.
     */
    protected getParallelGroupIdForAgent(agentId: string): number | undefined;
    /**
     * Create handoff tools for agents based on handoff edges only
     */
    private createHandoffTools;
    /**
     * Create handoff tools for an edge (handles multiple destinations)
     * @param edge - The graph edge defining the handoff
     * @param sourceAgentId - The ID of the agent that will perform the handoff
     * @param sourceAgentName - The human-readable name of the source agent
     */
    private createHandoffToolsForEdge;
    /**
     * Create a complete agent subgraph (similar to createReactAgent)
     */
    private createAgentSubgraph;
    /**
     * Detects if the current agent is receiving a handoff and processes the messages accordingly.
     * Returns filtered messages with the transfer tool call/message removed, plus any instructions,
     * source agent, and parallel sibling information extracted from the transfer.
     *
     * Supports both single handoffs (last message is the transfer) and parallel handoffs
     * (multiple transfer ToolMessages, need to find the one targeting this agent).
     *
     * @param messages - Current state messages
     * @param agentId - The agent ID to check for handoff reception
     * @returns Object with filtered messages, extracted instructions, source agent, and parallel siblings
     */
    private processHandoffReception;
    /**
     * Create the multi-agent workflow with dynamic handoffs
     */
    createWorkflow(): t.CompiledMultiAgentWorkflow;
}
