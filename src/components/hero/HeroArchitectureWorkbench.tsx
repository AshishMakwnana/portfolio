import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Database,
  Globe,
  Layers,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import type { ArchitectureNode, ArchitectureWorkflow } from '../../types/portfolio';
import { resolveTerminalCommand } from '../../utils/portfolioLogic';
import { Skeleton } from '../ui/Skeleton';

interface HeroArchitectureWorkbenchProps {
  nodes: ArchitectureNode[];
  workflows: ArchitectureWorkflow[];
  loading: boolean;
}

const NODE_ICONS: Record<string, typeof Globe> = {
  client: Globe,
  gateway: ShieldCheck,
  laravel: Layers,
  database: Database,
};

const QUICK_COMMANDS = [
  { label: 'route:list', command: 'artisan route:list' },
  { label: 'migrate:status', command: 'artisan migrate:status' },
  { label: 'queue:monitor', command: 'artisan queue:monitor' },
  { label: 'whoami', command: 'whoami' },
  { label: 'help', command: 'help' },
];

export function HeroArchitectureWorkbench({
  nodes,
  workflows,
  loading,
}: HeroArchitectureWorkbenchProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] =
    useState<ArchitectureWorkflow['id']>('rest-api');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('laravel');
  const [commandInput, setCommandInput] = useState('');
  const [customOutput, setCustomOutput] = useState<string[] | null>(null);

  if (loading || workflows.length === 0) {
    return (
      <div className="rounded-xl border border-[#263244] bg-[#111827] p-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#263244] pb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="mt-5 h-48 w-full" />
      </div>
    );
  }

  const activeWorkflow =
    workflows.find((item) => item.id === selectedWorkflowId) ?? workflows[0];

  const activeNode =
    nodes.find((item) => item.id === selectedNodeId) ?? nodes[0];

  const displayedLines = customOutput ?? activeWorkflow.terminalLines;

  const handleSelectWorkflow = (workflowId: ArchitectureWorkflow['id']) => {
    setSelectedWorkflowId(workflowId);
    setCustomOutput(null);
    const wf = workflows.find((item) => item.id === workflowId);
    if (wf && wf.activeNodeIds.length > 0) {
      setSelectedNodeId(
        wf.activeNodeIds.includes('laravel')
          ? 'laravel'
          : wf.activeNodeIds[0],
      );
    }
  };

  const executeCommand = (rawCommand: string) => {
    const result = resolveTerminalCommand(rawCommand, workflows);
    if (!result.handled) return;

    if (result.clearTerminal) {
      setCustomOutput(['Console cleared. Select a workflow tab or type "help".']);
      return;
    }

    if (result.matchedWorkflowId) {
      setSelectedWorkflowId(result.matchedWorkflowId);
      setCustomOutput(null);
      return;
    }

    setCustomOutput([`$ ${rawCommand.trim()}`, ...result.outputLines]);
  };

  const handleCommandSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commandInput.trim()) return;
    executeCommand(commandInput);
    setCommandInput('');
  };

  return (
    <section
      aria-label="Interactive Backend Architecture Workbench"
      className="flex h-full flex-col rounded-xl border border-[#263244] bg-[#111827]"
    >
      {/* Top Workbench Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#263244] px-5 py-3.5">
        <div
          role="tablist"
          aria-label="Backend system workflows"
          className="flex items-center gap-1 rounded-lg bg-[#080B12] p-1 border border-[#263244]"
        >
          {workflows.map((workflow) => {
            const isSelected = workflow.id === activeWorkflow.id;
            return (
              <button
                key={workflow.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectWorkflow(workflow.id)}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer',
                  isSelected
                    ? 'bg-[#161F2E] text-[#38BDF8]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]',
                ].join(' ')}
              >
                {workflow.tabLabel}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs tabular-nums text-[#94A3B8]">
          <span className="text-[#38BDF8]">{activeWorkflow.endpointLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#22C55E]">{activeWorkflow.statusLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{activeWorkflow.latencyLabel}</span>
        </div>
      </div>

      {/* Connected Architecture Flow */}
      <div className="border-b border-[#263244] px-5 py-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-medium text-[#94A3B8]">
            Request Execution Pipeline
          </span>
          <span className="font-mono text-[11px] text-[#64748B]">
            Click a node to inspect layer
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {nodes.map((node, index) => {
            const Icon = NODE_ICONS[node.id] ?? Layers;
            const isActiveInFlow = activeWorkflow.activeNodeIds.includes(node.id);
            const isInspected = activeNode?.id === node.id;

            return (
              <div key={node.id} className="relative flex items-stretch">
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  aria-pressed={isInspected}
                  className={[
                    'w-full rounded-lg border p-3 text-left transition-colors duration-200 cursor-pointer flex flex-col justify-between',
                    isInspected
                      ? 'border-[#38BDF8] bg-[#161F2E]'
                      : isActiveInFlow
                        ? 'border-[#38BDF8]/40 bg-[#161F2E]/70 hover:border-[#38BDF8]/70'
                        : 'border-[#263244] bg-[#080B12]/60 opacity-65 hover:opacity-100',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <Icon
                      className={[
                        'h-4 w-4 shrink-0',
                        isActiveInFlow ? 'text-[#38BDF8]' : 'text-[#64748B]',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[10px] text-[#64748B] whitespace-nowrap">
                      {node.layer}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs font-semibold text-[#F8FAFC] leading-snug">
                      {node.label}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#94A3B8] leading-tight">
                      {node.protocol}
                    </p>
                  </div>
                </button>

                {index < nodes.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden sm:flex items-center justify-center w-2.5 shrink-0"
                  >
                    <ArrowRight
                      className={[
                        'h-3 w-3',
                        isActiveInFlow ? 'text-[#38BDF8]' : 'text-[#263244]',
                      ].join(' ')}
                    />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {activeNode ? (
          <div className="mt-3 rounded-lg border border-[#263244] bg-[#080B12] px-3.5 py-2.5 text-xs text-[#94A3B8]">
            <span className="font-semibold text-[#F8FAFC]">{activeNode.label}: </span>
            <span>{activeNode.summary}</span>
          </div>
        ) : null}
      </div>

      {/* Interactive Terminal Output & Command Runner */}
      <div className="flex flex-1 flex-col justify-between bg-[#080B12] rounded-b-xl px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#263244]/80">
            <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] whitespace-nowrap shrink-0">
              <Terminal className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
              <span>artisan-console</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_COMMANDS.slice(0, 4).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => executeCommand(preset.command)}
                  className="rounded border border-[#263244] bg-[#111827] px-2 py-1 font-mono text-[11px] text-[#94A3B8] hover:border-[#38BDF8]/60 hover:text-[#F8FAFC] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <pre
            aria-live="polite"
            className="mt-3 min-h-[132px] overflow-x-auto font-mono text-xs leading-relaxed text-[#E2E8F0] tabular-nums"
          >
            {displayedLines.map((line, idx) => {
              const isPrompt = line.startsWith('$');
              const isSuccess = line.includes('[OK]') || line.includes('200 OK') || line.includes('[Ran]');
              return (
                <div
                  key={`${idx}-${line.slice(0, 12)}`}
                  className={
                    isPrompt
                      ? 'text-[#38BDF8] font-medium'
                      : isSuccess
                        ? 'text-[#E2E8F0]'
                        : 'text-[#94A3B8]'
                  }
                >
                  {line}
                </div>
              );
            })}
          </pre>
        </div>

        <form
          onSubmit={handleCommandSubmit}
          className="mt-3 flex items-center gap-2 border-t border-[#263244]/80 pt-3"
        >
          <label htmlFor="hero-terminal-input" className="sr-only">
            Run inspection command
          </label>
          <span aria-hidden="true" className="font-mono text-xs text-[#38BDF8]">
            $
          </span>
          <input
            id="hero-terminal-input"
            type="text"
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            placeholder='Type "help", "artisan route:list", or "whoami"...'
            className="w-full bg-transparent font-mono text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md border border-[#263244] bg-[#111827] px-2.5 py-1 font-mono text-[11px] font-medium text-[#F8FAFC] hover:border-[#38BDF8]/60 hover:text-[#38BDF8] transition-colors cursor-pointer shrink-0"
          >
            Run
          </button>
        </form>
      </div>
    </section>
  );
}
