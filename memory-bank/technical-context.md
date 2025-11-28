# Technical Context

## Overview
- **Project Name:** TubeMe - AI-Powered YouTube Thumbnail & Title Generator
- **One-line Summary:** Next.js web application that generates AI-powered YouTube titles and customizable thumbnails with drag-and-drop text overlays
- **Assumptions:**
  - Users have modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
  - Users will provide their own API keys for Gemini and Together APIs
  - Desktop-first experience (1024px+), mobile support is secondary
  - Single-session workflow with no persistence between visits beyond localStorage API keys
- **Non-Goals:**
  - User authentication or cloud storage
  - Advanced text effects (stroke, shadow, gradients)
  - Mobile-first optimization
  - Analytics or A/B testing
  - Social sharing or direct YouTube upload

## Technology Stack

**Language(s):**
- TypeScript 5.x (strict mode enabled)
- Rationale: Type safety for complex canvas operations, API interactions, and state management reduces runtime errors

**Framework(s):**
- Next.js 16.0.5 with App Router
- React 19.2.0
- Rationale: Next.js 16 provides API routes for secure API key proxying, server-side capabilities for future enhancements, and excellent developer experience. React 19 offers improved performance and concurrent features.

**CSS Framework:**
- Tailwind CSS v4
- Rationale: Utility-first approach enables rapid UI development, consistent design system, and minimal CSS bundle size

**Database/Storage:**
- Browser localStorage (client-side only)
- Rationale: No backend database needed for MVP. API keys and user preferences stored locally. Simple, fast, no infrastructure costs.

**Infra/Runtime:**
- Vercel (recommended deployment target)
- Node.js 20+ runtime
- Rationale: Vercel provides seamless Next.js deployment, edge functions for API routes, and automatic HTTPS

**Key Dependencies:**

Core dependencies (already installed):
- `next@16.0.5` - Framework
- `react@19.2.0` / `react-dom@19.2.0` - UI library
- `tailwindcss@4` - Styling

Required additional dependencies:
- `react-colorful@5.6.1` - Color picker component (lightweight, accessible, no jQuery)
- `sonner@1.4.0` - Toast notification system (beautiful, performant, TypeScript-first)
- `canvas-confetti@1.9.0` - Optional: Success celebration after download
- `@google/generative-ai@0.19.0` - Gemini API client SDK
- `together-ai@0.6.0` - Together API client SDK

Dev dependencies (already installed):
- `typescript@5` - Type checking
- `@types/node@20`, `@types/react@19`, `@types/react-dom@19` - Type definitions
- `eslint@9` / `eslint-config-next@16.0.5` - Code quality

## Architecture

**Style:** Single-Page Application (SPA) with Next.js App Router + API Routes
- Rationale: Hybrid architecture allows client-side canvas manipulation for responsiveness while API routes proxy sensitive API calls to protect keys from client exposure

**Context Diagram (textual):**

Components:
- **Client (Browser):**
  - React UI Components (TitleGenerator, ThumbnailEditor, TemplateGallery, TextControls)
  - Canvas API for text overlay and image manipulation
  - localStorage for API keys and preferences

- **Next.js API Routes (Server-side):**
  - `/api/generate-titles` - Proxies Gemini Flash API
  - `/api/generate-image` - Proxies Together API (Flux Schnell)

- **External Services:**
  - Google Gemini Flash API (title generation)
  - Together API with Flux Schnell model (image generation)

Data flows:
- User Input → TitleGenerator → `/api/generate-titles` → Gemini API → 10 titles returned → UI
- Selected Title → ImageGenerator → `/api/generate-image` → Together API → Base image URL → Canvas
- User uploads image → Canvas directly (no API call)
- Template selection → Load from localStorage → Apply to canvas
- Canvas manipulation (drag text, style) → Client-side only → Export to PNG → Download

**Boundaries & Ownership:**

1. **Client Layer** (`app/` directory):
   - `page.tsx` - Main application shell, state orchestration
   - `components/TitleGenerator.tsx` - Title input and AI generation UI
   - `components/ThumbnailEditor.tsx` - Canvas-based thumbnail editor
   - `components/TextControls.tsx` - Font, size, color controls
   - `components/TemplateGallery.tsx` - Pre-designed templates
   - `lib/canvas.ts` - Canvas manipulation utilities
   - `lib/storage.ts` - localStorage abstractions
   - `types/index.ts` - Shared TypeScript types

2. **API Layer** (`app/api/` directory):
   - `generate-titles/route.ts` - Gemini API proxy
   - `generate-image/route.ts` - Together API proxy
   - `lib/gemini.ts` - Gemini client wrapper
   - `lib/together.ts` - Together client wrapper

3. **Shared Layer** (`lib/` directory):
   - `result.ts` - Result type implementation
   - `constants.ts` - App constants (canvas dimensions, defaults)

**Integration Points:**
- **Gemini Flash API:** POST requests with topic/prompt, returns array of 10 title suggestions
- **Together API (Flux Schnell):** POST requests with text prompt (title), returns image URL
- **Canvas API:** Native browser API for image manipulation and text rendering
- **localStorage:** Store/retrieve API keys, user preferences, template definitions

## Data Model & Contracts

**Primary Entities:**

1. **ThumbnailState** (client-side state)
   - `backgroundImage: string | null` - Base64 or URL
   - `text: TextOverlay` - Text content and positioning
   - `dimensions: { width: 1280, height: 720 }` - YouTube standard

2. **TextOverlay**
   - `content: string` - Text to display
   - `position: { x: number, y: number }` - Canvas coordinates
   - `style: TextStyle` - Font, size, color

3. **TextStyle**
   - `fontFamily: string` - Selected font
   - `fontSize: number` - Size in pixels
   - `color: string` - Hex color code

4. **Template**
   - `id: string` - Unique identifier
   - `name: string` - Display name
   - `backgroundUrl: string` - Template image URL
   - `defaultText: TextOverlay` - Pre-positioned text

**Critical Schemas or Interfaces (high-level):**

```typescript
// Result type for all async operations
interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

// API request/response contracts
interface GenerateTitlesRequest {
  topic: string;
  apiKey: string;
}

interface GenerateTitlesResponse {
  titles: string[];
}

interface GenerateImageRequest {
  prompt: string;
  apiKey: string;
}

interface GenerateImageResponse {
  imageUrl: string;
}
```

**API Surface (high-level):**

- **POST /api/generate-titles**
  - Input: `{ topic: string, apiKey: string }`
  - Output: `Result<{ titles: string[] }>`
  - Errors: 400 (invalid input), 401 (invalid API key), 500 (API failure)

- **POST /api/generate-image**
  - Input: `{ prompt: string, apiKey: string }`
  - Output: `Result<{ imageUrl: string }>`
  - Errors: 400 (invalid input), 401 (invalid API key), 500 (API failure)

- **Versioning:** v1 implicit (no version prefix in MVP)
- **Pagination:** N/A for MVP
- **Error Format:** `{ success: false, error: string, metadata?: object }`

## Quality, SLOs & Performance Budgets

**SLOs:**
- **Availability:** 99.5% (Vercel infrastructure reliability)
- **p95 Latency:**
  - Title generation: < 10 seconds (success criteria from brief)
  - Image generation: < 30 seconds (dependent on Together API)
  - Canvas operations: < 100ms (client-side, should be instant)
  - Full workflow: < 3 minutes (success criteria from brief)
- **Error Rate:** < 5% for API calls (excluding user-caused errors like invalid API keys)
- **Success Rate:** 90% of users complete first thumbnail (success criteria from brief)

**Performance Budgets:**
- Initial page load: < 3s on desktop (1024px+, cable connection)
- Time to Interactive (TTI): < 4s
- First Contentful Paint (FCP): < 1.5s
- Canvas export (PNG): < 2s for 1280x720 image
- Client-side bundle size: < 500KB gzipped

**Capacity Assumptions:**
- Peak concurrent users: 100 (MVP scale)
- API calls per user session: ~5-10 title generations, 3-5 image generations
- No server-side rate limiting (users manage their own API quotas)
- localStorage limit: ~5MB (sufficient for API keys + templates)

## Security & Compliance

**Threat Model (high-level):**
- **Primary risks:** API key exposure, prompt injection attacks, XSS via user input
- **Data sensitivity:** API keys (high), user prompts (low), generated content (low)
- **Authentication:** None required (client-side only app)
- **Authorization:** Not applicable (no user accounts)

**Controls:**

OWASP ASVS alignment:
- **V5 (Validation):** Input sanitization for all user text (topic, custom text overlay)
- **V8 (Data Protection):** API keys stored in localStorage (encrypted by browser), never logged
- **V13 (API):** Rate limiting delegated to external APIs (Gemini, Together)
- **V14 (Config):** No hardcoded secrets, environment variables for development

Specific controls:
- **Input Validation:**
  - Topic input: max 500 characters, sanitize HTML entities
  - Text overlay: max 200 characters, sanitize HTML entities
  - File upload: validate MIME types (image/png, image/jpeg), max 5MB
- **Rate Limiting:** Client-side debouncing (500ms) for API calls
- **TLS:** Enforced by Vercel (automatic HTTPS)
- **Secrets Management:**
  - Development: `.env.local` for API keys (gitignored)
  - Production: Users provide their own keys (stored in localStorage)
  - API routes validate keys before proxying

**Data Protection:**
- **Encryption at rest:** localStorage encrypted by browser (OS-level)
- **Encryption in transit:** HTTPS for all API calls (TLS 1.3)
- **Key Management:** Users manage their own API keys, no server-side storage
- **PII Handling:** No PII collected. User prompts sent to external APIs (subject to their privacy policies)
- **GDPR:** Not applicable (no user accounts, no tracking, no cookies beyond localStorage)

**Access:**
- **Roles:** Not applicable (no authentication)
- **Least Privilege:** API routes only proxy requests, cannot access localStorage
- **Service Accounts:** Developer API keys for testing (never committed to repo)

**Logging & Audit:**
- **Development:** Console logs for all API calls, errors, state changes
- **Production:** Server-side logs for API route errors (no user data), client-side error boundaries
- **Retention:** Not applicable (no persistent logging in MVP)
- **Sensitive Data:** API keys never logged, prompts logged only in development

## Observability

**Logging:**
- **Structure:** JSON format for server-side logs (Next.js default)
- **Correlation IDs:** Generate unique ID per user session (UUID in sessionStorage)
- **Levels:** DEBUG (dev only), INFO (API calls), WARN (validation failures), ERROR (exceptions)
- **Client-side:** Console logs in development, structured error reports in production

**Metrics:**
- **Service KPIs:**
  - Title generation success rate
  - Image generation success rate
  - Average time per workflow completion
  - Canvas export success rate
- **RED Signals:**
  - Rate: API calls per minute
  - Errors: Failed API calls (4xx, 5xx)
  - Duration: p50, p95, p99 latencies for API routes
- **USE Signals:** Not applicable (serverless, no persistent resources)

**Tracing:**
- **Propagation:** Session ID passed through all client-server calls
- **Sampling:** 100% in development, 10% in production (if implemented)
- **Spans:** API route execution, external API calls

**Dashboards/Alerts:**
- **Baseline Alerts:**
  - API route error rate > 10% (5-minute window)
  - API route p95 latency > 15 seconds
  - Page load time > 5 seconds
- **SLO Burn Alerts:**
  - Availability < 99.5% over 1-hour window
  - Error budget exhausted (5% threshold)
- **Tools:** Vercel Analytics (built-in), optional Sentry integration

## Environments & Operations

**Environments:**
- **Development:** Local (localhost:3000)
  - Developer-provided API keys in `.env.local`
  - Hot reload enabled
  - Debug logging enabled
  - No drift from production (same Next.js version)

- **Production:** Vercel deployment
  - Users provide their own API keys via UI
  - Production builds with optimizations
  - Error logging only
  - Environment variables: `NODE_ENV=production`

**Drift Policy:** No environment-specific code. Feature flags for future enhancements.

**Build & Release:**
- **CI Triggers:** Git push to main branch (automatic Vercel deployment)
- **Artifact Repo:** Vercel build cache
- **Promotion Gates:**
  - TypeScript compilation succeeds
  - ESLint passes (no errors, warnings acceptable)
  - Manual smoke test (create one thumbnail end-to-end)
- **Rollback:** Vercel instant rollback to previous deployment

**Runtime Config:**
- **Feature Flags:** Not implemented in MVP (future: LaunchDarkly or similar)
- **Secrets:** API keys in `.env.local` (dev), localStorage (production)
- **Config Strategy:** Compile-time configuration (Next.js env variables)

**Backup/DR:**
- **RPO (Recovery Point Objective):** N/A (no persistent data)
- **RTO (Recovery Time Objective):** < 5 minutes (Vercel redeploy)
- **Strategy:** Stateless application, no backups required

**Runbooks:**

1. **API Route Failing (500 errors):**
   - Check Vercel logs for error details
   - Verify external API status (Gemini, Together)
   - Validate API keys in environment
   - Rollback to previous deployment if needed

2. **Slow Title/Image Generation:**
   - Check external API status pages
   - Verify network latency (Vercel edge location)
   - Review API request payloads (prompt length)
   - Consider increasing timeout thresholds

3. **Canvas Export Failing:**
   - Check browser console for errors
   - Verify canvas dimensions (1280x720)
   - Test in different browser (Safari has stricter CORS)
   - Ensure image loaded completely before export

## Key Technical Decisions (ADR Mini-Log)

| ADR | Decision | Date | Status | Rationale | Alternatives |
|-----|----------|------|--------|-----------|--------------|
| ADR-001 | Use native Canvas API for text overlay | 2025-11-28 | Accepted | No external dependencies, full control over rendering, excellent browser support. Custom drag-and-drop is ~50 lines of code. | fabric.js (40KB, overkill for single text box), Konva (60KB, React wrapper adds complexity) |
| ADR-002 | Store API keys in localStorage | 2025-11-28 | Accepted | No backend storage needed, users control their keys, no server costs. Aligns with "users provide own keys" requirement. | Backend key management (requires auth), session storage (keys lost on tab close), cookies (4KB limit) |
| ADR-003 | Use API routes as proxy for external APIs | 2025-11-28 | Accepted | Protects API keys from direct browser exposure, allows server-side validation, enables future rate limiting. | Direct client calls (exposes keys in network tab), separate backend service (over-engineered for MVP) |
| ADR-004 | React Context for app state | 2025-11-28 | Accepted | Simple, built-in solution. No external state library needed for single-page app with shallow component tree. | Redux (overkill, boilerplate), Zustand (extra dependency), props drilling (works but verbose) |
| ADR-005 | Tailwind CSS v4 for styling | 2025-11-28 | Accepted | Required by project constraints. Provides utility-first approach, excellent DX, minimal CSS bundle. | CSS Modules (more verbose), styled-components (runtime cost), plain CSS (no design system) |
| ADR-006 | Sonner for toast notifications | 2025-11-28 | Accepted | Best-in-class UX, TypeScript-first, 3KB gzipped, beautiful defaults, accessible. | react-hot-toast (good alternative), custom solution (reinventing wheel) |
| ADR-007 | Template storage in localStorage as JSON | 2025-11-28 | Accepted | Simple persistence, user-defined templates, no backend. Small data size (~50KB for 10 templates). | Hardcoded templates only (less flexible), IndexedDB (overkill for simple JSON) |
| ADR-008 | YouTube dimensions as hard constraint (1280x720) | 2025-11-28 | Accepted | YouTube standard, requirement from brief. Simplifies canvas logic (no responsive resizing). | Flexible dimensions (adds complexity), multiple export sizes (out of scope) |

## Risks & Mitigations

**Technical Risks:**

- **Risk:** Canvas export fails in Safari due to CORS restrictions on external images
  - **Impact:** HIGH - Users cannot download thumbnails
  - **Mitigation:** Proxy images through API route to add CORS headers, implement fallback to right-click save

- **Risk:** External API rate limits or downtime (Gemini, Together)
  - **Impact:** MEDIUM - Feature unavailable temporarily
  - **Mitigation:** Clear error messages, retry logic with exponential backoff, cache successful responses

- **Risk:** localStorage quota exceeded (rare, but possible with many templates)
  - **Impact:** LOW - Cannot save new templates
  - **Mitigation:** Implement quota monitoring, prompt user to delete old templates, max 20 templates

- **Risk:** Large image uploads (user uploads 50MB image)
  - **Impact:** MEDIUM - Browser hangs, poor UX
  - **Mitigation:** File size validation (5MB max), client-side compression before canvas load

- **Risk:** Text positioning off-screen after template load
  - **Impact:** LOW - Confusing UX
  - **Mitigation:** Validate text coordinates on load, constrain drag bounds to canvas dimensions

**Security Risks:**

- **Risk:** Prompt injection attacks on AI APIs
  - **Impact:** MEDIUM - Unexpected AI behavior, potential API abuse
  - **Mitigation:** Input length limits, sanitization, monitor API usage patterns

- **Risk:** XSS via user-entered text displayed on canvas
  - **Impact:** LOW - Canvas renders as image, not HTML (inherently safe)
  - **Mitigation:** Sanitize text before canvas rendering as defense-in-depth

## Open Questions

None at this time. All architectural decisions have been made based on project brief requirements and constraints.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-28
**Status:** Ready for Implementation
**Next Phase:** Create development-patterns.md, then proceed to Project Implementer Agent
