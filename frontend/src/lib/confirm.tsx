import { createContext, useCallback, useContext, useState } from 'react'

interface ConfirmOptions { title?: string; confirmText?: string; danger?: boolean }
interface PromptOptions { title?: string; placeholder?: string; defaultValue?: string; confirmText?: string }

type Ask = (message: string, opts?: ConfirmOptions) => Promise<boolean>
type AskText = (message: string, opts?: PromptOptions) => Promise<string | null>

const ConfirmContext = createContext<Ask>(async () => false)
const PromptContext = createContext<AskText>(async () => null)
export const useConfirm = () => useContext(ConfirmContext)
export const usePrompt = () => useContext(PromptContext)

type State =
  | { kind: 'confirm'; message: string; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: 'prompt'; message: string; opts: PromptOptions; value: string; resolve: (v: string | null) => void }

// Diálogos propios (no usan window.confirm / window.prompt, que el navegador
// puede silenciar — y entonces "no funcionan" borrar o crear).
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State | null>(null)

  const ask: Ask = useCallback((message, opts = {}) =>
    new Promise<boolean>(resolve => setState({ kind: 'confirm', message, opts, resolve })), [])

  const askText: AskText = useCallback((message, opts = {}) =>
    new Promise<string | null>(resolve =>
      setState({ kind: 'prompt', message, opts, value: opts.defaultValue ?? '', resolve })), [])

  const closeConfirm = (v: boolean) => setState(s => { if (s?.kind === 'confirm') s.resolve(v); return null })
  const closePrompt = (v: string | null) => setState(s => { if (s?.kind === 'prompt') s.resolve(v); return null })

  return (
    <ConfirmContext.Provider value={ask}>
      <PromptContext.Provider value={askText}>
        {children}
        {state && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 animate-fade-in"
              onClick={() => state.kind === 'confirm' ? closeConfirm(false) : closePrompt(null)} />
            <div className="relative ios-card w-full max-w-xs p-5 animate-sheet-center">
              {state.opts.title && <h3 className="font-semibold text-gray-900 mb-1 text-center">{state.opts.title}</h3>}
              <p className="text-sm text-gray-600 text-center">{state.message}</p>

              {state.kind === 'prompt' && (
                <input
                  autoFocus
                  value={state.value}
                  placeholder={state.opts.placeholder}
                  onChange={e => setState(s => (s && s.kind === 'prompt' ? { ...s, value: e.target.value } : s))}
                  onKeyDown={e => { if (e.key === 'Enter') closePrompt(state.value.trim() || null) }}
                  className="ios-field mt-3"
                />
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => state.kind === 'confirm' ? closeConfirm(false) : closePrompt(null)}
                  className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold"
                >
                  Cancelar
                </button>
                {state.kind === 'confirm' ? (
                  <button
                    onClick={() => closeConfirm(true)}
                    className={`flex-1 py-2.5 rounded-xl text-white font-semibold ${state.opts.danger === false ? 'bg-brand-600' : 'bg-red-500'}`}
                  >
                    {state.opts.confirmText ?? 'Eliminar'}
                  </button>
                ) : (
                  <button
                    onClick={() => closePrompt(state.value.trim() || null)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold"
                  >
                    {state.opts.confirmText ?? 'Guardar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </PromptContext.Provider>
    </ConfirmContext.Provider>
  )
}
