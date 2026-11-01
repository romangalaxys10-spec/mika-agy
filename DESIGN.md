# System Design Specifications
**Project**: Build end-to-end autonomous coding engine
**Engine**: Mika Autonomous Coder Team

## 1. Component Architecture
```mermaid
graph TD
    Client[Mika UI & WKWebView Desk] --> Server[Mika Agent Server 8765]
    Server --> CoderTeam[Autonomous Coder Team Pipeline]
    CoderTeam --> Architect[Lead Architect: Plan]
    CoderTeam --> Designer[Designer: Schemas]
    CoderTeam --> Engineer[Code Engineer: Implementation]
    CoderTeam --> QA[QA Engineer: Test & Heal]
    CoderTeam --> Reviewer[Reviewer: Security Audit]
    CoderTeam --> Witness[Witness: In-Toto Provenance]
```

## 2. Interface Contracts
- **Task API**: `/api/v1/tasks` (Start, Poll, Steer, Cancel)
- **MCP Bridge**: `/api/v1/mcp/*` (Marketplace, Install, Call, Toggle)
- **Coder Team API**: `/api/v1/coder/team` (Full autonomous run)
- **Secret Scope**: Automatic regex scrubbing on all stdout/stderr channels.
