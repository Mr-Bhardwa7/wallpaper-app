import { CreditCard } from "lucide-react";

const BuyCreditsModal = ({showBuyCredits, setShowBuyCredits, credits, setCredits}: {showBuyCredits: boolean, setShowBuyCredits: (showBuyCredits: boolean) => void, credits: number, setCredits: (credits: number) => void}) => {
    return showBuyCredits && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 max-w-md w-full mx-4">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Buy AI Credits</h3>
        
                <div className="space-y-4 mb-6">
                    {[
                        { credits: 10, price: '$2.99', popular: false },
                        { credits: 25, price: '$6.99', popular: true },
                        { credits: 50, price: '$12.99', popular: false }
                    ].map((plan) => (
                        <div key={plan.credits} className={`p-4 rounded-xl border cursor-pointer transition-all ${plan.popular
                                ? 'border-cyan-500/50 bg-cyan-500/10'
                                : 'border-gray-700/50 hover:border-gray-600/50'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-semibold">{plan.credits} Credits</span>
                                        {plan.popular && (
                                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">Popular</span>
                                        )}
                                    </div>
                                    <div className="text-gray-400 text-sm">{plan.price}</div>
                                </div>
                                <input type="radio" name="credits" className="w-4 h-4 text-cyan-500" defaultChecked={plan.popular} />
                            </div>
                        </div>
                    ))}
                </div>
        
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowBuyCredits(false)}
                        className="flex-1 py-3 bg-gray-800/50 text-white rounded-xl hover:bg-gray-700/50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setCredits(credits + 25);
                            setShowBuyCredits(false);
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}
  
export default BuyCreditsModal;