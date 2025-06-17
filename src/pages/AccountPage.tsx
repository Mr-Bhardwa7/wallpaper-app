import { User } from "lucide-react";

  const AccountPage = () => (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Account</h2>
        
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">Guest User</h3>
          <p className="text-gray-400 mb-6">Sign in to sync your favorites across devices</p>
          
          <div className="space-y-3 max-w-sm mx-auto">
            <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              Sign in with Google
            </button>
            <button className="w-full py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              Sign in with Email
            </button>
          </div>
        </div>
      </div>
    </div>
);
  
export default AccountPage;