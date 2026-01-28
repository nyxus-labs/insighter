# Unified Tool Architecture Documentation

## 1. Overview
The Unified Tool Architecture allows independent tools (Notebooks, Data Managers, Experiment Trackers) to operate in isolated environments while communicating through a shared **System Bus**. This ensures modularity, scalability, and robust inter-tool workflows.

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph "Studio Environment (Client-Side)"
        ToolProvider[ToolContext Provider]
        
        subgraph "System Bus"
            EB[Event Bus / Dispatcher]
            Validator[Schema Validator (Zod)]
            ACL[Access Control List]
            DLQ[Dead Letter Queue]
        end
        
        ToolProvider --> EB
        EB --> Validator
        Validator --> ACL
        ACL -->|Allowed| Deliver[Deliver Message]
        ACL -->|Denied| LogError[Log Error]
        Validator -->|Invalid| DLQ
        
        subgraph "Tools"
            T1[Notebook Tool]
            T2[Data Tool]
            T3[Experiment Tool]
        end
        
        T1 <-->|useToolCommunication| EB
        T2 <-->|useToolCommunication| EB
        T3 <-->|useToolCommunication| EB
    end

    subgraph "Observability"
        Monitor[Tool Monitor UI]
        Monitor -.-> DLQ
        Monitor -.-> EB
    end
```

## 3. Core Concepts

### 3.1 Linkage Mechanism (The System Bus)
The core linkage is implemented via `ToolContext` using a Publish/Subscribe pattern.
- **Broadcast**: One-to-many communication (e.g., `DATA_LOAD` event).
- **Direct Message**: Point-to-point communication (e.g., triggering a specific action in another tool).
- **Shared State**: A global key-value store for persistent session data.

### 3.2 Communication Protocols
All messages must adhere to strict JSON Schemas defined in `lib/tools/schemas.ts`.

**Base Message Structure:**
```typescript
interface ToolMessage {
  id: string;          // UUID
  sourceToolId: string;// ID of sending tool
  targetToolId?: string; // Optional: specific recipient
  type: string;        // Event Type (e.g., 'DATA_LOAD')
  payload: any;        // Schema-validated content
  timestamp: number;
}
```

### 3.3 Security & ACL
Tools define `allowedSources` in their registry definition (`lib/constants/tools.ts`). The System Bus rejects messages from unauthorized sources.

## 4. Error Handling & Resilience

- **Schema Validation**: Invalid messages are rejected and moved to the **Dead Letter Queue (DLQ)**.
- **Retry Logic**: The system attempts to deliver messages 3 times with exponential backoff before failing.
- **Dead Letter Queue**: A holding area for failed messages, visible in the Tool Monitor for debugging/replay.

## 5. Integration Guide: Adding a New Tool

### Step 1: Define Tool Metadata
Add your tool to `lib/constants/tools.ts`:
```typescript
{
  id: 'my-new-tool',
  name: 'My Tool',
  supportedEvents: ['MY_EVENT'],
  allowedSources: ['notebook', 'system'], // ACL
  // ...
}
```

### Step 2: Define Message Schema (Optional but Recommended)
Add a schema to `lib/tools/schemas.ts`:
```typescript
export const MyEventSchema = BaseMessageSchema.extend({
  type: z.literal('MY_EVENT'),
  payload: z.object({
    data: z.string()
  })
});
```

### Step 3: Use the Hook
In your component:
```typescript
import { useToolCommunication } from '@/hooks/useToolCommunication';

export default function MyToolComponent() {
  const { emit, on } = useToolCommunication({
    toolId: 'my-new-tool',
    subscriptions: ['SOME_OTHER_EVENT'],
    onMessage: (msg) => console.log('Received:', msg)
  });

  const doSomething = () => {
    emit('MY_EVENT', { data: 'Hello World' });
  };
  
  // ...
}
```

## 6. Observability
A built-in **Tool Monitor** (floating widget in Studio) provides real-time visibility into:
- Message Logs (Info, Warn, Error)
- Dead Letter Queue contents (with Retry capability)
- Active Tool Registry status
