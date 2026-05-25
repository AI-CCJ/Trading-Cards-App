import React from 'react';
import { X, Mail, MessageSquare, Phone, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-blue-600">
          <div className="flex items-center space-x-3 text-white">
            <ShieldCheck className="h-6 w-6" />
            <h2 className="text-xl font-bold">帮助中心</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">联系客服</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">如果您遇到任何问题，欢迎通过以下方式联系我们，我们将尽快为您解决。</p>
          </div>

          <div className="space-y-4">
            {/* WeChat */}
            <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase">官方微信</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">15815768962</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('15815768962');
                  alert('微信已复制到剪贴板');
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                复制
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4 text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase">官方邮箱</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">326411139@qq.com</p>
              </div>
              <a 
                href="mailto:326411139@qq.com"
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                发送
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
            <p className="text-xs text-gray-400">服务时间：周一至周日 9:00 - 22:00</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            返回平台
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
