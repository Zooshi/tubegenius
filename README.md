# TubeGenius

AI-powered YouTube thumbnail and title generator using GPT-4 mini and Flux Schnell.

![TubeGenius Screenshot](https://via.placeholder.com/1200x630/0A1628/00D9C0?text=TubeGenius)

## Features

- **AI Title Generation**: Generate 10 YouTube-optimized titles using OpenAI GPT-4 mini
- **AI Thumbnail Creation**: Create professional 1280x720 thumbnails with Flux Schnell
- **Custom Image Upload**: Use your own background images
- **Drag-and-Drop Text Editor**: Position text anywhere on your thumbnail
- **Text Customization**: Choose fonts, sizes, and colors with a visual color picker
- **Download as PNG**: Export your thumbnails in YouTube-ready format
- **Dark Modern UI**: Beautiful, professional interface built with Next.js 16 and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **AI Models**:
  - OpenAI GPT-4 mini (title generation)
  - Together AI Flux Schnell (image generation)
- **UI Components**: React 19, react-colorful, sonner

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Together AI API key ([Get one here](https://api.together.xyz/settings/api-keys))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Zooshi/tubegenius.git
cd tubegenius/tubeme
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp sample.env .env.local
```

Edit `.env.local` and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
TOGETHER_API_KEY=your_together_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Enter API Keys**: Click "API Settings" and add your OpenAI and Together AI keys
2. **Generate Titles**: Enter your video topic and click "Start"
3. **Select a Title**: Click on one of the 10 generated titles
4. **Generate Thumbnail**: Click "Generate Thumbnail Image" (takes 30-60 seconds)
5. **Customize Text**: Add text, change font, size, and color
6. **Position Text**: Drag the text to your desired location on the canvas
7. **Download**: Click "Download Thumbnail" to save your 1280x720 PNG

## Project Structure

```
tubeme/
├── app/
│   ├── api/
│   │   ├── generate-titles/    # OpenAI GPT-4 mini integration
│   │   └── generate-image/     # Together AI Flux Schnell integration
│   ├── components/             # React components
│   ├── context/                # React Context for state management
│   ├── lib/                    # Utilities (canvas, storage, validators)
│   ├── types/                  # TypeScript type definitions
│   └── page.tsx                # Main application page
├── public/                     # Static assets
└── sample.env                  # Environment variables template
```

## Features in Detail

### AI Title Generation
- Powered by OpenAI GPT-4 mini
- Generates 10 click-worthy, SEO-optimized titles
- Character limit: 500 characters for topic input
- Response time: ~5-10 seconds

### AI Thumbnail Generation
- Powered by Together AI's Flux Schnell model
- Standard YouTube dimensions: 1280x720 (16:9)
- No text in generated images (text added separately)
- Generation time: 30-60 seconds
- CORS-safe: Images converted to base64 data URLs

### Text Customization
- 5 font families: Arial, Impact, Georgia, Verdana, Comic Sans MS
- Font size: 20-200px (adjustable slider)
- Full color picker with 12 quick-select presets
- Drag-and-drop positioning
- Text shadow for better visibility

## Security & Privacy

- API keys are stored locally in your browser (localStorage)
- Keys are never sent to our servers
- All API calls go directly to OpenAI and Together AI
- No user data is collected or stored
- `.env.local` is git-ignored to protect your keys

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will detect Next.js automatically
4. Deploy! (No environment variables needed - users add their own keys)

### Other Platforms

The app works on any platform that supports Next.js 16:
- Netlify
- AWS Amplify
- Railway
- Render

## Roadmap

- [ ] Multiple text layers
- [ ] Pre-made thumbnail templates
- [ ] More font options
- [ ] Text effects (stroke, glow, etc.)
- [ ] Shape and icon overlays
- [ ] Batch thumbnail generation
- [ ] Export history

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/) and [Together AI](https://www.together.ai/)
- UI inspired by modern YouTube creator tools

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/Zooshi/tubegenius/issues) page
2. Create a new issue with details about your problem
3. Make sure you have valid API keys configured

---

**Made with Claude Code** | [Report an Issue](https://github.com/Zooshi/tubegenius/issues)
