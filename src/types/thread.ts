/**
 * Types for thread/conversation management
 */

export interface ThreadSummary {
  threadId: string;
  projectId: string;
  title: string;
  lastMessage: string;
  lastUpdated: Date;
  messageCount: number;
}
