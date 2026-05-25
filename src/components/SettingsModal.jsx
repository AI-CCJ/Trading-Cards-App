import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Follow system
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!isOpen) return null;

  const handleClearCache = () => {
    setIsResetting(true);
    setTimeout(() => {
      localStorage.clear();
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">系统设置</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">外观与主题</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', icon: Sun, label: '浅色' },
                { id: 'dark', icon: Moon, label: '深色' },
                { id: 'system', icon: Monitor, label: '跟随系统' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === item.id 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                      : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <item.icon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Maintenance Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">维护与重置</h3>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/20">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-400">重置本地缓存</h4>
                  <p className="text-xs text-red-700 dark:text-red-500/80 mt-1 leading-relaxed">
                    这将清空所有本地存储的数据并重新登录。通常用于解决页面显示异常或登录状态卡死的问题。
                  </p>
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="mt-4 flex items-center justify-center space-x-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>立即重置</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            完成
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl p-6 shadow-2xl text-center">
            {isResetting ? (
              <div className="py-8">
                <Loader className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
                <p className="text-gray-900 dark:text-white font-bold">正在清理并重载...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">确认重置？</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">此操作不可撤销，您将需要重新登录账号。</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleClearCache}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold"
                  >
                    确认
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Loader = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default SettingsModal;
