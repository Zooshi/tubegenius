# TubeMe - AI-Powered YouTube Thumbnail & Title Generator

## Problem Statement
YouTube creators spend significant time crafting compelling video titles and thumbnails that attract viewers and improve click-through rates. The process often involves multiple tools, design skills, and trial-and-error to find the right combination that resonates with their audience. Many creators lack design expertise or the time to create professional-quality thumbnails from scratch.

## Solution Approach
TubeMe is a Next.js web application that streamlines the entire workflow by using AI to generate both optimized video titles and custom thumbnails in a single, intuitive interface. Creators simply enter their video topic, receive AI-generated title suggestions, select their favorite, and then customize an AI-generated thumbnail with drag-and-drop text positioning and styling controls - all without leaving the application.

## Target Users
YouTube content creators of all experience levels who need quick, professional assistance with video titles and thumbnails. This includes solo creators, small production teams, and anyone looking to improve their video presentation quality without investing in complex design tools or extensive design knowledge.

## Success Criteria
- Users can generate 10 optimized YouTube titles from a single topic input in under 10 seconds
- Users can create, customize, and download professional 1280x720 thumbnails with custom text overlays
- The complete workflow (topic input to final thumbnail download) takes under 3 minutes
- Interface is intuitive enough for first-time users to complete the workflow without instructions
- All AI generation features work reliably with appropriate error handling and loading states
- 90% of users successfully complete at least one thumbnail creation in their first session

## Project Scope

**In Scope:**
- Single-page web application built with Next.js 16 and TypeScript
- AI title generation using Gemini Flash API (10 titles per request)
- AI thumbnail generation using Together API with Flux Schnell model
- Text overlay editor with drag-and-drop positioning
- Basic text customization: font selection (3-5 options), size, and color
- Regeneration capabilities for both titles and thumbnails
- Template gallery with pre-designed thumbnail styles users can start from
- Image upload feature allowing users to use their own background images
- Download functionality for final thumbnails (1280x720 PNG format)
- User-provided API key storage in browser localStorage
- Loading states and error messages during AI operations
- Responsive design optimized for desktop use (1024px+ primary target)
- Beautiful, modern, YouTube creator-friendly interface design

**Out of Scope:**
- User authentication or account creation
- Cloud storage or history/gallery of previously created thumbnails
- Multiple text boxes or text layers on single thumbnail
- Advanced text effects (stroke, shadow, gradients, 3D effects)
- Video upload or editing capabilities
- Analytics or A/B testing features
- Mobile-first optimization (mobile support is secondary)
- Thumbnail performance analytics or click-through rate tracking
- Social media sharing or direct YouTube upload
- Collaboration or team features
- Payment processing or subscription management
- Alternative export formats beyond PNG (no JPG, WebP in initial release)

## Key Constraints

**Technical Constraints:**
- Must use Next.js 16 with TypeScript for framework
- Must use Tailwind CSS v4 for styling
- Thumbnails must adhere to YouTube standard: 1280x720 pixels (16:9 aspect ratio)
- AI text generation must not include text overlays on generated images (text added separately by user)
- Must work in modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- API keys stored client-side only (localStorage), never sent to backend except for API calls

**Design Constraints:**
- No emojis in code or UI elements (can cause rendering issues)
- Interface must be beautiful, modern, and professional
- Must feel native to YouTube creator workflows and aesthetics
- Loading states must provide clear feedback during AI processing

**Development Constraints:**
- Development environment requires two API keys: GEMINI_API_KEY and TOGETHER_API_KEY
- Users must provide their own API keys for production use
- Error messages should display actual errors during development phase
- Production-ready error handling with user-friendly toast notifications to be implemented later

**Business Constraints:**
- Single-session workflow only (no persistence between visits)
- No centralized API key management or rate limiting
- Users responsible for their own API usage and costs

## Open Questions

None - all critical requirements have been clarified and documented above.

---

**Project Brief Version:** 1.0
**Last Updated:** 2025-11-28
**Status:** Requirements Finalized - Ready for Technical Architecture Phase

**Next Steps:**
- Proceed to Technical Architect Agent for architecture design and technology stack decisions
- Define component structure, state management approach, and API integration patterns
- Establish development patterns for error handling, loading states, and user interactions
