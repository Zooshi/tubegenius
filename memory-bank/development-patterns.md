# Development Patterns

## Code Organization

**Repo Layout:**
```
tubeme/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes (server-side)
│   │   ├── generate-titles/
│   │   │   └── route.ts        # Gemini API proxy
│   │   └── generate-image/
│   │       └── route.ts        # Together API proxy
│   ├── components/              # React components
│   │   ├── TitleGenerator.tsx  # Title input and generation UI
│   │   ├── ThumbnailEditor.tsx # Canvas-based editor
│   │   ├── TextControls.tsx    # Font, size, color controls
│   │   ├── TemplateGallery.tsx # Template selection UI
│   │   ├── ImageUpload.tsx     # File upload component
│   │   └── LoadingState.tsx    # Loading spinner/skeleton
│   ├── lib/                     # Shared utilities
│   │   ├── canvas.ts           # Canvas manipulation functions
│   │   ├── storage.ts          # localStorage abstractions
│   │   ├── api-client.ts       # API call wrappers
│   │   └── result.ts           # Result type implementation
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts            # Shared types
│   ├── context/                 # React Context providers
│   │   └── AppContext.tsx      # Global app state
│   ├── globals.css             # Global Tailwind styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main application page
├── public/                      # Static assets
│   ├── templates/              # Pre-designed template images
│   └── fonts/                  # Web fonts
├── .env.local                  # Local environment variables (gitignored)
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

**Module Boundaries:**
- **API routes** (`app/api/`) should NOT import from `app/components/` or `app/context/`
- **Components** can import from `lib/`, `types/`, `context/`, but not from `api/`
- **lib/** modules should be pure functions with no React dependencies (testable in isolation)
- **types/** should be shared across client and server (no side effects)

**Allowed Dependencies:**
- `app/page.tsx` → `components/`, `context/`, `lib/`, `types/`
- `app/components/*.tsx` → `lib/`, `types/`, `context/`, other components
- `app/api/*/route.ts` → `lib/` (only server-safe utilities), `types/`
- `app/lib/*.ts` → `types/` only
- `app/context/*.tsx` → `types/`, `lib/`

**Layering:**
1. **Presentation Layer:** Components (UI, user interactions)
2. **State Layer:** React Context (app state management)
3. **Business Logic Layer:** lib/ utilities (canvas, storage, API clients)
4. **API Layer:** API routes (external service proxies)
5. **Type Layer:** Shared TypeScript definitions

**Dependency Management:**
- **Package Manager:** npm (lockfile: `package-lock.json`)
- **Version Pinning:** Exact versions for core dependencies (`next`, `react`), caret ranges for utilities (`^` for minor updates)
- **Updates Cadence:** Monthly dependency audit, immediate security patches
- **Adding Dependencies:** Justify in PR description, check bundle size impact (use bundlephobia.com)

## Coding Standards

**Naming/Style:**
- **Files:**
  - Components: PascalCase (`TitleGenerator.tsx`)
  - Utilities: camelCase (`canvas.ts`, `api-client.ts`)
  - Types: PascalCase (`index.ts` exports PascalCase types)
  - API routes: kebab-case folders (`generate-titles/route.ts`)
- **Variables:**
  - camelCase for variables and functions (`thumbnailState`, `generateTitles`)
  - PascalCase for React components and types (`ThumbnailEditor`, `Result`)
  - UPPER_SNAKE_CASE for constants (`CANVAS_WIDTH`, `MAX_FILE_SIZE`)
  - Boolean variables: `is`, `has`, `can` prefix (`isLoading`, `hasApiKey`)
- **Functions:**
  - Verb-noun format (`processThumbnail`, `validateInput`, `exportCanvas`)
  - Event handlers: `handle` prefix (`handleTextDrag`, `handleColorChange`)
  - Async functions: `async` keyword, return `Promise<Result<T>>`

**Formatter/Linter:**
- ESLint with Next.js config (already configured)
- Prettier recommended (add later if team grows)
- TypeScript strict mode enabled (`strict: true` in tsconfig.json)

**Error Handling:**

**Pattern: Result Types (NOT exceptions for expected failures)**

```typescript
// ALWAYS use Result type for operations that can fail
interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Example: API call with Result type
async function generateTitles(
  topic: string,
  apiKey: string
): Promise<Result<string[]>> {
  try {
    // Validate inputs
    if (!topic || topic.length === 0) {
      return {
        success: false,
        error: 'Topic is required',
      };
    }

    if (topic.length > 500) {
      return {
        success: false,
        error: 'Topic must be less than 500 characters',
      };
    }

    // Make API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('/api/generate-titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, apiKey }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-ok responses
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to generate titles',
        metadata: { status: response.status },
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.titles,
      metadata: { timestamp: Date.now() },
    };
  } catch (error) {
    // Network errors, timeouts, etc.
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please try again.',
        };
      }
      return {
        success: false,
        error: `Network error: ${error.message}`,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
```

**Retry Logic:**
```typescript
// Use exponential backoff for transient failures
async function fetchWithRetry<T>(
  fetchFn: () => Promise<Response>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Result<T>> {
  let lastError: string = '';

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchFn();

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Client error',
          metadata: { status: response.status },
        };
      }

      // Retry server errors (5xx)
      lastError = `Server error: ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`,
  };
}
```

**Idempotency:**
- API routes should be idempotent where possible
- Use unique request IDs for tracking (session ID + timestamp)
- Canvas operations should be replayable (store operation history)

**Input Validation:**

**Where:** Client-side (immediate feedback) AND server-side (security)

```typescript
// Client-side validation (immediate UX feedback)
function validateTopic(topic: string): Result<string> {
  if (!topic || topic.trim().length === 0) {
    return {
      success: false,
      error: 'Topic cannot be empty',
    };
  }

  if (topic.length > 500) {
    return {
      success: false,
      error: 'Topic must be less than 500 characters',
    };
  }

  // Sanitize HTML entities
  const sanitized = topic
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();

  return {
    success: true,
    data: sanitized,
  };
}

// Server-side validation (API route)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, apiKey } = body;

    // Validate presence
    if (!topic || typeof topic !== 'string') {
      return Response.json(
        { success: false, error: 'Invalid topic' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return Response.json(
        { success: false, error: 'API key is required' },
        { status: 401 }
      );
    }

    // Validate constraints
    if (topic.length > 500) {
      return Response.json(
        { success: false, error: 'Topic too long' },
        { status: 400 }
      );
    }

    // Proceed with business logic...
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

**Shared Validators:**
Create reusable validators in `lib/validators.ts`:

```typescript
export const Validators = {
  topic: (value: string): Result<string> => {
    // Implementation as shown above
  },

  imageFile: (file: File): Result<File> => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Only PNG and JPEG images are allowed',
      };
    }

    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image must be less than 5MB',
      };
    }

    return { success: true, data: file };
  },

  apiKey: (key: string): Result<string> => {
    if (!key || key.trim().length === 0) {
      return {
        success: false,
        error: 'API key is required',
      };
    }

    // Basic format validation (if known)
    if (key.length < 20) {
      return {
        success: false,
        error: 'API key appears invalid',
      };
    }

    return { success: true, data: key.trim() };
  },
};
```

**API Conventions:**

**Status Codes:**
- `200` - Success with data
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid API key)
- `500` - Internal Server Error (unexpected failures)

**Error Envelope:**
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  metadata?: {
    field?: string;      // Which field caused the error
    status?: number;     // HTTP status
    timestamp?: number;  // When error occurred
  };
}
```

**Success Envelope:**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  metadata?: {
    timestamp?: number;
    cached?: boolean;
  };
}
```

**Versioning:** No API versioning in MVP (implicit v1)

**Pagination:** Not applicable (fixed response sizes: 10 titles, 1 image URL)

**Data Access:**

**ORM/Queries:** Not applicable (no database in MVP)

**localStorage Access Pattern:**
```typescript
// lib/storage.ts
export class Storage {
  private static PREFIX = 'tubeme_';

  static set<T>(key: string, value: T): Result<void> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serialized);
      return { success: true, data: undefined };
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Please delete some templates.',
        };
      }
      return {
        success: false,
        error: 'Failed to save data',
      };
    }
  }

  static get<T>(key: string): Result<T | null> {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) {
        return { success: true, data: null };
      }
      const parsed = JSON.parse(item) as T;
      return { success: true, data: parsed };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load data',
      };
    }
  }

  static remove(key: string): Result<void> {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to remove data',
      };
    }
  }
}
```

**Concurrency/Async:**

**Patterns:**
- Use `async/await` for all asynchronous operations
- Implement timeouts for external API calls (15 seconds for Gemini, 45 seconds for Together)
- Use `AbortController` for cancellable requests
- Debounce user input (500ms) before API calls

**Cancellation:**
```typescript
// Store abort controller in component state
const [abortController, setAbortController] = useState<AbortController | null>(null);

const handleGenerate = async () => {
  // Cancel previous request if still running
  if (abortController) {
    abortController.abort();
  }

  const controller = new AbortController();
  setAbortController(controller);

  try {
    const response = await fetch('/api/generate-titles', {
      signal: controller.signal,
      // ... other options
    });
    // Handle response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Request was cancelled, don't show error
      return;
    }
    // Handle other errors
  } finally {
    setAbortController(null);
  }
};
```

**Timeouts:**
```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string = 'Request timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    ),
  ]);
}
```

## Testing Strategy

**Pyramid Targets:**
- **Unit tests:** 70% coverage (lib/ utilities, pure functions)
- **Component tests:** 20% coverage (React components with mocked APIs)
- **E2E tests:** 10% coverage (critical user flows with Playwright)

**Test Organization:**
```
tubeme/
├── app/
│   ├── lib/
│   │   ├── canvas.ts
│   │   └── canvas.test.ts          # Co-located unit tests
│   └── components/
│       ├── TitleGenerator.tsx
│       └── TitleGenerator.test.tsx  # Co-located component tests
└── e2e/
    └── thumbnail-creation.spec.ts   # E2E tests
```

**Fixtures/Test Data:**
- Create `app/lib/test-utils.ts` for shared test fixtures
- Deterministic data (no randomness in tests)
- Mock external API responses with realistic data

**CI Gates:**
- TypeScript compilation: `npm run build` must succeed
- ESLint: `npm run lint` must pass (zero errors, warnings acceptable)
- Tests: `npm test` must pass (all tests)
- Coverage threshold: 60% overall (enforced by test runner)

**Test Matrix:**
- OS: Windows, macOS, Linux (CI runs on Ubuntu)
- Browsers: Chrome, Firefox, Safari (E2E tests)
- Node: 20.x, 22.x (CI runs both)

**Contracts:**
- Mock external APIs with fixed responses
- Document API contract expectations in test files
- Use TypeScript to enforce request/response shapes

## Performance Patterns

**Profiling:**
- **Tools:** React DevTools Profiler, Chrome DevTools Performance tab
- **When:** Before major releases, when investigating slowness
- **Metrics:** Component render time, bundle size, API response times

**Caching:**
- **What:** API responses (titles, image URLs), loaded templates
- **Where:** React state (session-level), localStorage (cross-session)
- **Invalidation:** Manual regenerate button, localStorage version bump on app updates

```typescript
// Example: Cache titles in state to avoid regeneration
const [cachedTitles, setCachedTitles] = useState<{
  topic: string;
  titles: string[];
  timestamp: number;
} | null>(null);

const generateTitles = async (topic: string) => {
  // Check cache (valid for 5 minutes)
  if (cachedTitles &&
      cachedTitles.topic === topic &&
      Date.now() - cachedTitles.timestamp < 5 * 60 * 1000) {
    return { success: true, data: cachedTitles.titles };
  }

  // Fetch new titles...
  const result = await fetchTitles(topic);
  if (result.success) {
    setCachedTitles({
      topic,
      titles: result.data,
      timestamp: Date.now(),
    });
  }
  return result;
};
```

**Batching/Streaming:**
- Not applicable for MVP (single API calls, no streams)
- Future: Consider streaming for long-running image generation

**Image Optimization:**
- Compress uploaded images client-side before canvas load
- Use `next/image` for static assets (templates in public/)
- Lazy load template gallery images (IntersectionObserver)

**Performance Anti-Patterns to Avoid:**
1. **Inline object/array creation in render:** Causes unnecessary re-renders
   ```typescript
   // BAD
   <Component style={{ margin: 10 }} />

   // GOOD
   const style = { margin: 10 }; // Outside component or useMemo
   <Component style={style} />
   ```

2. **Missing dependency arrays in useEffect:** Causes infinite loops
   ```typescript
   // BAD
   useEffect(() => {
     fetchData();
   }); // Runs on every render!

   // GOOD
   useEffect(() => {
     fetchData();
   }, [dependency]); // Runs only when dependency changes
   ```

3. **Large bundle imports:** Import only what you need
   ```typescript
   // BAD
   import _ from 'lodash'; // Imports entire library

   // GOOD
   import debounce from 'lodash/debounce'; // Imports only debounce
   ```

4. **Unnecessary re-renders:** Use React.memo for expensive components
   ```typescript
   // Memoize components that receive stable props
   export const ThumbnailEditor = React.memo(({ imageUrl, onExport }) => {
     // Component implementation
   });
   ```

## Security Practices

**AuthN/AuthZ:**
- Not applicable (no user accounts)
- API key validation: Check format, test with minimal API call on first use

**Secrets Management:**
- **Development:** `.env.local` file (gitignored)
  ```
  GEMINI_API_KEY=your_key_here
  TOGETHER_API_KEY=your_key_here
  ```
- **Production:** Users enter keys via UI, stored in localStorage
- **Rotation Policy:** Users manage their own keys, no automated rotation

**Input Hardening:**

**Sanitize/Escape:**
```typescript
// Use DOMPurify for user-generated content (if rendering HTML)
// For canvas text, HTML rendering is not an issue, but still sanitize for logs

function sanitizeText(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
```

**File Uploads:**
```typescript
function validateImageFile(file: File): Result<File> {
  // MIME type check
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Only PNG and JPEG images are allowed',
    };
  }

  // Size check
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      success: false,
      error: 'Image must be less than 5MB',
    };
  }

  // Additional: Check file signature (magic bytes) for extra security
  return { success: true, data: file };
}
```

**Supply Chain:**
- **Dep Audit:** Run `npm audit` monthly, fix high/critical vulnerabilities immediately
- **SBOM:** Generate with `npm list --json > sbom.json` before releases
- **Signing:** Not implemented in MVP (consider for future if distributing binaries)

**Data Privacy:**
- **PII Handling:** No PII collected. User prompts sent to external APIs (document in privacy policy)
- **Minimization:** Only collect data necessary for functionality (topic, titles, API keys)
- **Retention:** No server-side retention (stateless API routes), localStorage managed by user

**Logging Best Practices:**
- NEVER log API keys
- NEVER log full error stack traces in production (only error messages)
- Sanitize user input before logging
- Use structured logging in API routes:
  ```typescript
  console.log(JSON.stringify({
    level: 'info',
    message: 'Title generation requested',
    topic: sanitizedTopic.substring(0, 50), // Truncate for logs
    timestamp: Date.now(),
  }));
  ```

## Observability & Ops Patterns

**Logs:**
- **Structure:** JSON format for server-side logs
  ```typescript
  const logger = {
    info: (message: string, metadata?: object) => {
      console.log(JSON.stringify({ level: 'info', message, ...metadata, timestamp: Date.now() }));
    },
    error: (message: string, error?: Error, metadata?: object) => {
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error?.message,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        ...metadata,
        timestamp: Date.now(),
      }));
    },
  };
  ```

- **PII Scrubbing:** Automatically remove sensitive data
  ```typescript
  function scrubSensitiveData(obj: any): any {
    const sensitiveKeys = ['apiKey', 'password', 'token'];
    const scrubbed = { ...obj };

    for (const key of sensitiveKeys) {
      if (key in scrubbed) {
        scrubbed[key] = '[REDACTED]';
      }
    }

    return scrubbed;
  }
  ```

**Metrics:**

**Standard Counters (Future: Send to analytics service):**
- `title_generation_requests` - Total title generation requests
- `title_generation_success` - Successful title generations
- `title_generation_failure` - Failed title generations
- `image_generation_requests` - Total image generation requests
- `image_generation_success` - Successful image generations
- `image_generation_failure` - Failed image generations
- `thumbnail_exports` - Total thumbnail downloads

**RED Signals:**
- **Rate:** Requests per minute (track in API routes)
- **Errors:** Error rate percentage (failures / total requests)
- **Duration:** p50, p95, p99 latencies (track in API routes with `performance.now()`)

**USE Signals:** Not applicable (serverless, no persistent resources)

**Tracing:**
- **Propagation:** Generate session ID on first load, pass through all API calls
  ```typescript
  // Generate on page load
  const sessionId = crypto.randomUUID();
  sessionStorage.setItem('sessionId', sessionId);

  // Include in API calls
  const response = await fetch('/api/generate-titles', {
    headers: {
      'X-Session-ID': sessionId,
    },
    // ... other options
  });
  ```

- **Spans:** Not implemented in MVP (consider OpenTelemetry for future)

**Alerts:**
- **Default Alert Set:**
  - API route error rate > 10% (5-minute window)
  - API route p95 latency > 15 seconds
  - Page load time > 5 seconds
  - Build failures in CI

**On-Call Handoff:** Not applicable (no dedicated on-call for MVP)

**Runbooks Template:**
See technical-context.md for detailed runbooks (API failures, slow generation, canvas export issues)

## Tooling & Automation

**Linters/Formatters:**
- **ESLint:** Already configured with `eslint-config-next`
  ```json
  // eslint.config.mjs (already present)
  {
    "extends": ["next"],
    "rules": {
      "no-console": ["warn", { "allow": ["error", "warn"] }],
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  }
  ```

- **Prettier (Recommended):**
  ```json
  // .prettierrc (to be added)
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  }
  ```

**Type Checking:**
- **TypeScript:** Strict mode enabled
  ```json
  // tsconfig.json (already configured)
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true
    }
  }
  ```

- **Pre-commit Check:** Run `tsc --noEmit` to catch type errors before commit

**Code Review:**
- **Required Approvals:** 1 reviewer for team projects (N/A for solo development)
- **PR Checklist:**
  - [ ] TypeScript compiles (`npm run build`)
  - [ ] ESLint passes (`npm run lint`)
  - [ ] All tests pass (`npm test`)
  - [ ] No console.log statements (except logger utility)
  - [ ] API keys not hardcoded
  - [ ] New components have tests
  - [ ] Performance impact considered (bundle size, render time)

**Release:**
- **Semantic Versioning:** `MAJOR.MINOR.PATCH` (e.g., 1.0.0)
  - MAJOR: Breaking changes (rare in MVP)
  - MINOR: New features
  - PATCH: Bug fixes
- **Changelog Policy:** Update CHANGELOG.md for each release
  ```markdown
  ## [1.1.0] - 2025-12-01
  ### Added
  - Template gallery with 5 pre-designed templates
  - Image upload feature for custom backgrounds

  ### Fixed
  - Canvas export fails in Safari
  - Text positioning off-screen after template load
  ```

**Migrations:**
- **Database Migrations:** Not applicable (no database)
- **localStorage Schema Changes:**
  ```typescript
  // Version stored in localStorage
  const STORAGE_VERSION = 1;

  function migrateStorage() {
    const currentVersion = Storage.get<number>('version').data || 0;

    if (currentVersion < 1) {
      // Migrate to version 1 (e.g., rename keys, transform data)
      // ... migration logic
      Storage.set('version', 1);
    }
  }

  // Run on app initialization
  migrateStorage();
  ```

## Examples (Required)

### 1. Error Handling Pattern

```typescript
// lib/api-client.ts
async function generateTitles(
  topic: string,
  apiKey: string
): Promise<Result<string[]>> {
  try {
    // Validate inputs
    const validation = Validators.topic(topic);
    if (!validation.success) {
      return validation as Result<string[]>;
    }

    // Make API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('/api/generate-titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: validation.data, apiKey }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle response
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to generate titles',
        metadata: { status: response.status },
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.titles,
      metadata: { timestamp: Date.now() },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please try again.',
        };
      }
      return {
        success: false,
        error: `Network error: ${error.message}`,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
```

### 2. API Error Envelope

```typescript
// app/api/generate-titles/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { topic, apiKey } = body;

    // Validate inputs
    if (!topic || typeof topic !== 'string') {
      return Response.json(
        {
          success: false,
          error: 'Topic is required and must be a string',
          metadata: { field: 'topic' },
        },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return Response.json(
        {
          success: false,
          error: 'API key is required',
          metadata: { field: 'apiKey' },
        },
        { status: 401 }
      );
    }

    // Call external API
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 10 engaging YouTube video titles for this topic: ${topic}. Return only the titles, one per line, numbered 1-10.`,
          }],
        }],
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return Response.json(
        {
          success: false,
          error: 'Failed to generate titles. Please check your API key.',
          metadata: {
            status: geminiResponse.status,
            details: errorText,
          },
        },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();

    // Parse titles from response
    const titlesText = geminiData.candidates[0].content.parts[0].text;
    const titles = titlesText
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 10);

    // Success response
    return Response.json(
      {
        success: true,
        data: { titles },
        metadata: { timestamp: Date.now() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in generate-titles:', error);
    return Response.json(
      {
        success: false,
        error: 'Internal server error',
        metadata: { timestamp: Date.now() },
      },
      { status: 500 }
    );
  }
}
```

### 3. Database Transaction with Retry (Adapted for localStorage)

```typescript
// lib/storage.ts - Transactional storage operations
export class StorageTransaction {
  private operations: Array<() => void> = [];
  private rollbacks: Array<() => void> = [];

  add<T>(key: string, value: T): this {
    // Store operation
    this.operations.push(() => {
      const serialized = JSON.stringify(value);
      localStorage.setItem(Storage.PREFIX + key, serialized);
    });

    // Store rollback (restore previous value)
    this.rollbacks.push(() => {
      const previous = localStorage.getItem(Storage.PREFIX + key);
      if (previous) {
        localStorage.setItem(Storage.PREFIX + key, previous);
      } else {
        localStorage.removeItem(Storage.PREFIX + key);
      }
    });

    return this;
  }

  async commit(): Promise<Result<void>> {
    // Attempt operations with retry
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Execute all operations
        for (const operation of this.operations) {
          operation();
        }

        return { success: true, data: undefined };
      } catch (error) {
        // Rollback on failure
        for (const rollback of this.rollbacks) {
          try {
            rollback();
          } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
          }
        }

        // Retry with exponential backoff
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        } else {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Transaction failed',
          };
        }
      }
    }

    return { success: false, error: 'Transaction failed after retries' };
  }
}

// Usage example
async function saveTemplate(template: Template): Promise<Result<void>> {
  const transaction = new StorageTransaction();

  transaction
    .add(`template_${template.id}`, template)
    .add('last_template_id', template.id);

  return transaction.commit();
}
```

### 4. Background Job with Timeout/Cancellation (Image Generation)

```typescript
// lib/image-generator.ts
interface ImageGenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: string; // Image URL
  error?: string;
  controller: AbortController;
}

class ImageGenerationQueue {
  private jobs: Map<string, ImageGenerationJob> = new Map();

  async generateImage(
    prompt: string,
    apiKey: string,
    timeoutMs: number = 45000
  ): Promise<Result<string>> {
    const jobId = crypto.randomUUID();
    const controller = new AbortController();

    // Create job
    const job: ImageGenerationJob = {
      id: jobId,
      status: 'pending',
      controller,
    };
    this.jobs.set(jobId, job);

    try {
      // Update status
      job.status = 'processing';

      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      // Make API call
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        job.status = 'failed';
        job.error = errorData.error;
        return {
          success: false,
          error: errorData.error || 'Image generation failed',
        };
      }

      const data = await response.json();
      job.status = 'completed';
      job.result = data.imageUrl;

      return {
        success: true,
        data: data.imageUrl,
        metadata: { jobId },
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          job.status = 'cancelled';
          return {
            success: false,
            error: 'Image generation timed out or was cancelled',
          };
        }
        job.status = 'failed';
        job.error = error.message;
        return {
          success: false,
          error: error.message,
        };
      }
      job.status = 'failed';
      return {
        success: false,
        error: 'Unknown error',
      };
    } finally {
      // Cleanup job after 5 minutes
      setTimeout(() => this.jobs.delete(jobId), 5 * 60 * 1000);
    }
  }

  cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'processing') {
      job.controller.abort();
      job.status = 'cancelled';
    }
  }

  getJobStatus(jobId: string): ImageGenerationJob | undefined {
    return this.jobs.get(jobId);
  }
}

// Singleton instance
export const imageQueue = new ImageGenerationQueue();

// Usage in component
const [currentJobId, setCurrentJobId] = useState<string | null>(null);

const handleGenerateImage = async (prompt: string) => {
  const result = await imageQueue.generateImage(prompt, apiKey);

  if (result.success) {
    setImageUrl(result.data);
  } else {
    toast.error(result.error);
  }
};

const handleCancel = () => {
  if (currentJobId) {
    imageQueue.cancelJob(currentJobId);
  }
};
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-28
**Status:** Ready for Implementation
**Next Phase:** Proceed to Project Implementer Agent for full-stack development
