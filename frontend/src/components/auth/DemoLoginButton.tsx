import React from 'react';

interface DemoLoginButtonProps {
  onDemoLogin: () => void;
}

const DemoLoginButton: React.FC<DemoLoginButtonProps> = ({ onDemoLogin }) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
      <button
        onClick={onDemoLogin}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <span>🚀 Demo Login</span>
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Skip authentication for testing purposes
      </p>
    </div>
  );
};

export default DemoLoginButton;
