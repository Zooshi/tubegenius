import ApiKeySettings from './components/ApiKeySettings';
import TitleGenerator from './components/TitleGenerator';
import ThumbnailEditor from './components/ThumbnailEditor';
import ImageUpload from './components/ImageUpload';
import TextControls from './components/TextControls';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            TubeGenius
          </h1>
          <p className="text-xl text-white/80">
            AI-Powered YouTube Thumbnail & Title Generator
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <ApiKeySettings />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TitleGenerator />
            <ImageUpload />
          </div>

          <div className="space-y-6">
            <ThumbnailEditor />
            <TextControls />
          </div>
        </div>

        <footer className="text-center mt-12 text-white/60 text-sm">
          <p>Made with Claude Code | Your API keys are stored locally and never sent to our servers</p>
        </footer>
      </div>
    </div>
  );
}
