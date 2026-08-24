import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Gavel, Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mb-4">
            <Gavel className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center gap-2">
            منصة مزادك
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          
          <p className="text-slate-400 text-sm mb-6">
            المشروع جاهز تماماً ومعمارية الموديولات متوافقة 100% مع الباك إند.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="font-semibold text-emerald-400 block mb-1">React 18 + Vite 5</span>
              <span>بيئة فائقة السرعة</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="font-semibold text-amber-400 block mb-1">TypeScript Strict</span>
              <span>عقود خالية من الأخطاء</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="font-semibold text-sky-400 block mb-1">Tailwind CSS</span>
              <span>نظام تصميم موحد</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="font-semibold text-purple-400 block mb-1">TanStack Query</span>
              <span>كاشينج ذكي للبيانات</span>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;