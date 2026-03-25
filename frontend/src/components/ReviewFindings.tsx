import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number | null;
  title: string;
  description: string;
}

interface Suggestion {
  title: string;
  before: string;
  after: string;
}

interface Report {
  stage: string;
  overallScore: number;
  summary: string;
  findings: Finding[];
  suggestions: Suggestion[];
}

const SeverityIcon = ({ severity }: { severity: Finding['severity'] }) => {
  switch (severity) {
    case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
    case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case 'medium': return <Info className="w-5 h-5 text-yellow-500" />;
    case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
  }
};

const SeverityBadge = ({ severity }: { severity: Finding['severity'] }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider", colors[severity])}>
      {severity}
    </span>
  );
};

export default function ReviewFindings({ report }: { report: Report }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-200 pb-1 inline-block">Stage Summary</h3>
          <span className="text-xl font-bold bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
            Score: {report.overallScore}
          </span>
        </div>
        <p className="text-gray-700 bg-blue-50/50 p-5 rounded-xl border border-blue-100 leading-relaxed text-[15px] shadow-sm">
          {report.summary || "No summary provided for this stage."}
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-5 border-b-2 border-gray-100 pb-2 flex items-center gap-2">
          Findings <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{report.findings?.length || 0}</span>
        </h3>
        {report.findings && report.findings.length > 0 ? (
          <div className="space-y-4">
            {report.findings.map((finding, idx) => (
              <div key={idx} className="bg-white border text-left rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5"><SeverityIcon severity={finding.severity} /></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base">{finding.title}</h4>
                      <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">{finding.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <SeverityBadge severity={finding.severity} />
                    {finding.line && (
                      <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded shadow-inner">
                        Line: <span className="font-bold">{finding.line}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 bg-green-50 rounded-xl border border-green-100 border-dashed">
            <p className="text-green-700 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> No findings reported for this stage. Great job!
            </p>
          </div>
        )}
      </div>

      {report.suggestions && report.suggestions.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-5 border-b-2 border-gray-100 pb-2 flex items-center gap-2">
            Suggested Improvements <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{report.suggestions.length}</span>
          </h3>
          <div className="space-y-6">
            {report.suggestions.map((sug, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800">{sug.title}</h4>
                </div>
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  <div className="flex-1 p-5 bg-red-50/20">
                    <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Before
                    </div>
                    <pre className="text-[13px] font-mono whitespace-pre-wrap text-gray-800 overflow-x-auto p-4 bg-white rounded-lg border border-red-100 shadow-sm leading-relaxed">{sug.before}</pre>
                  </div>
                  <div className="flex-1 p-5 bg-green-50/20">
                    <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> After
                    </div>
                    <pre className="text-[13px] font-mono whitespace-pre-wrap text-gray-800 overflow-x-auto p-4 bg-white rounded-lg border border-green-100 shadow-sm leading-relaxed">{sug.after}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
