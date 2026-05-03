'use client'
import { useState } from 'react'
import type { DesignAnalysis as T } from '@/types/analysis'
import { Copy, Check, Palette, Code2, Layers } from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-100">
      {copied ? <><Check size={13} className="text-green-500" />복사됨</> : <><Copy size={13} />복사</>}
    </button>
  )
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative bg-gray-950 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-xs text-gray-400 font-mono">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 text-sm text-gray-100 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function DesignAnalysis({ data }: { data: T }) {
  const [codeTab, setCodeTab] = useState<'html' | 'css'>('html')

  if (!data || (!data.style_concept && !data.color_palette?.length)) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-500 text-sm">디자인 분석 데이터가 없습니다.</p>
        <p className="text-xs text-gray-400 mt-2">이 프로젝트를 재분석하면 디자인 코드가 생성됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 스타일 개념 */}
      {data.style_concept && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Layers size={16} />디자인 스타일 개념</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{data.style_concept}</p>
          {data.mood && (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.mood.split(',').map((k, i) => (
                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">{k.trim()}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 컬러 팔레트 */}
      {data.color_palette?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2"><Palette size={16} />컬러 팔레트</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.color_palette.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="w-full h-16 rounded-lg shadow-sm border border-gray-100"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="text-center w-full">
                  <p className="text-xs font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.hex}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 소재 제안 */}
      {data.materials?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">소재 제안</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-2 font-medium w-20">영역</th>
                <th className="text-left px-5 py-2 font-medium">추천 자재</th>
                <th className="text-left px-5 py-2 font-medium hidden sm:table-cell">선택 이유</th>
              </tr>
            </thead>
            <tbody>
              {data.materials.map((m, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-700 whitespace-nowrap">{m.area}</td>
                  <td className="px-5 py-3 text-gray-800">{m.material}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs hidden sm:table-cell">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 레이아웃 코드 변환 */}
      {(data.layout_html || data.layout_css) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2"><Code2 size={16} />레이아웃 코드 변환</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Claude Vision → Code</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">스케치에서 추출한 공간 구조를 HTML/CSS 코드로 변환했습니다. 직접 복사해 사용하세요.</p>
          <div className="flex gap-2 mb-3">
            {data.layout_html && (
              <button onClick={() => setCodeTab('html')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${codeTab === 'html' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                HTML
              </button>
            )}
            {data.layout_css && (
              <button onClick={() => setCodeTab('css')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${codeTab === 'css' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                CSS
              </button>
            )}
          </div>
          {codeTab === 'html' && data.layout_html && <CodeBlock code={data.layout_html} lang="html" />}
          {codeTab === 'css' && data.layout_css && <CodeBlock code={data.layout_css} lang="css" />}
        </div>
      )}
    </div>
  )
}
