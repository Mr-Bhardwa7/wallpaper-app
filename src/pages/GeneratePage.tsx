import { Wand2, RotateCw } from "lucide-react";
import { useState } from "react";

const GeneratePage = ({ credits, useCredit, setShowBuyCredits }: { credits: number, useCredit: () => void, setShowBuyCredits: (show: boolean) => void }) => {
    const [selectedStyle, setSelectedStyle] = useState('minimal');
    const [selectedResolution, setSelectedResolution] = useState('1920x1080');
    const [generatedImages, setGeneratedImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [promptText, setPromptText] = useState('');


    const generateAIWallpaper = async () => {
        if (credits < 1) {
        setShowBuyCredits(true);
        return;
        }
        
        setIsGenerating(true);
        useCredit();
        
        // Simulate AI generation
        setTimeout(() => {
        const newImages = [
            { id: Date.now() + 1, url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&h=1080&fit=crop', prompt: promptText },
            { id: Date.now() + 2, url: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=1920&h=1080&fit=crop', prompt: promptText },
            { id: Date.now() + 3, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop', prompt: promptText },
            { id: Date.now() + 4, url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop', prompt: promptText }
        ];
        setGeneratedImages(newImages as any); // Type assertion to fix type mismatch
        setIsGenerating(false);
        }, 3000);
    };
    
    return (
        <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Generate AI Wallpapers</h2>
                    <p className="text-gray-400">Describe your dream wallpaper and let AI bring it to life</p>
                </div>

                {/* Generation Form */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 mb-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Describe your wallpaper</label>
                            <textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                placeholder="A futuristic city skyline with neon lights reflecting on water at night..."
                                className="w-full h-32 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                                <select
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:outline-none"
                                >
                                    <option value="minimal">Minimal</option>
                                    <option value="sci-fi">Sci-Fi</option>
                                    <option value="vaporwave">Vaporwave</option>
                                    <option value="nature">Nature</option>
                                    <option value="abstract">Abstract</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                                <select
                                    value={selectedResolution}
                                    onChange={(e) => setSelectedResolution(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:outline-none"
                                >
                                    <option value="1920x1080">1920×1080 (Full HD)</option>
                                    <option value="2560x1440">2560×1440 (2K)</option>
                                    <option value="3840x2160">3840×2160 (4K)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={generateAIWallpaper}
                            disabled={isGenerating || !promptText.trim()}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Generate Wallpaper (1 credit)
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Generated Results */}
                {generatedImages.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Generated Wallpapers</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {generatedImages.map((image: any) => (
                                <div key={image?.id} className="group relative overflow-hidden rounded-xl bg-gray-800/50">
                                    <img
                                        src={image?.url || ''}
                                        alt="Generated wallpaper"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                            <button className="flex-1 py-2 bg-gray-900/80 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                                                Apply
                                            </button>
                                            <button className="flex-1 py-2 bg-gray-900/80 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                                                Save
                                            </button>
                                            <button
                                                onClick={() => generateAIWallpaper()}
                                                className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                            >
                                                <RotateCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
  
export default GeneratePage;
