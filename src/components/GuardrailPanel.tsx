import React from 'react';
import { ShieldCheck, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PillarState } from '../types';
import { assembleStylePrompt } from '../utils/promptEngine';

interface GuardrailPanelProps {
  pillarState: PillarState;
}

export const GuardrailPanel: React.FC<GuardrailPanelProps> = ({ pillarState }) => {
  const assembled = assembleStylePrompt(pillarState);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {assembled.guardrailPassed ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          )}
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Guardrail & Content Moderation Engine
          </h3>
        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            assembled.guardrailPassed
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {assembled.guardrailPassed ? 'PASSED — All Clear' : 'AUTO-SANITIZED'}
        </span>
      </div>

      {assembled.guardrailPassed ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>No trademarked artist names, explicit terms, or restricted brand keywords detected. Prompt is fully Suno compliance-ready.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-amber-300 font-medium">
            Trademarked artist names detected. Automatically sanitized into descriptive sound-alike genre tags:
          </p>

          <div className="space-y-1.5">
            {assembled.replacements.map((rep, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold line-through font-mono">
                    "{rep.original}"
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-emerald-400 font-semibold font-mono">
                    "{rep.replacedWith}"
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded self-start sm:self-auto">
                  Suno Sound-Alike Rule
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
