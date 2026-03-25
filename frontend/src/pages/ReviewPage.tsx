import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useReviewStore } from '../store/reviewStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2, Play } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import ReviewFindings from '../components/ReviewFindings';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
];

export default function ReviewPage() {
  const [code, setCode] = useState('// Write your code here to be reviewed');
  const [language, setLanguage] = useState('typescript');
  const { isAnalyzing, setIsAnalyzing, setReviewData, reports, currentSession } = useReviewStore();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.post('/api/review/analyze', {
        code,
        language,
        filename: `snippet.${language}`
      });
      
      setReviewData(response.data.session, response.data.reports);
      toast.success('Review completed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze code');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">AI Code Reviewer</h1>
        <div className="flex items-center space-x-4">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        <div className="w-1/2 border-r border-gray-200">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Results Pane */}
        <div className="flex flex-col w-1/2 bg-gray-50 overflow-hidden">
          {reports && reports.length > 0 ? (
            <div className="flex flex-col h-full bg-white shadow-sm m-4 rounded-xl overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review Summary</h2>
                    <p className="text-sm text-gray-500 mt-1">Multi-stage AI Analysis Results</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-500 bg-blue-50 shadow-inner">
                      <span className="text-xl font-bold text-blue-700">{currentSession?.overallScore || 0}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 mt-2 uppercase tracking-wide">Score</span>
                  </div>
                </div>
              </div>
              
              <Tabs.Root className="flex flex-col flex-1 overflow-hidden" defaultValue={reports[0]?.stage}>
                <Tabs.List className="flex px-4 pt-2 border-b border-gray-200 flex-shrink-0 bg-gray-50">
                  {reports.map((report) => (
                    <Tabs.Trigger
                      key={report.stage}
                      value={report.stage}
                      className="px-5 py-2.5 font-semibold text-sm text-gray-500 border-b-2 border-transparent hover:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 outline-none transition-colors"
                    >
                      {report.stage}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                <div className="flex-1 overflow-y-auto bg-white">
                  {reports.map((report) => (
                    <Tabs.Content key={report.stage} value={report.stage} className="p-6 outline-none">
                      <ReviewFindings report={report} />
                    </Tabs.Content>
                  ))}
                </div>
              </Tabs.Root>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center m-4 border-2 border-dashed border-gray-300 rounded-xl bg-white bg-opacity-50">
              <div className="w-20 h-20 mb-6 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center shadow-inner">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Review Data Yet</h3>
              <p className="max-w-md mx-auto text-sm text-gray-500 leading-relaxed">
                Enter your code in the editor and click "Analyze Code" to generate AI-driven insights across development, security, deployment, and production stages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
