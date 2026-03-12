import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ProjectResultTabs } from '@/components/project/ProjectResultTabs'
import { AnalyzeButton } from '@/components/project/AnalyzeButton'
import { AnalysisPoller } from '@/components/project/AnalysisPoller'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { SPACE_TYPES, PROJECT_STATUS_LABELS } from '@/lib/utils/constants'

export default async function ProjectResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) redirect('/dashboard')

  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
  const { data: analysis } = await supabase.from('analysis_results').select('*').eq('project_id', id).eq('is_current', true).single()

  const spaceLabel = SPACE_TYPES.find(t => t.value === project.space_type)?.label || project.space_type
  const statusInfo = PROJECT_STATUS_LABELS[project.status] || PROJECT_STATUS_LABELS.draft

  let sketchUrl: string | null = null
  if (project.sketch_url) {
    const { data: urlData } = await supabase.storage.from('project-files').createSignedUrl(project.sketch_url, 3600)
    sketchUrl = urlData?.signedUrl || null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header displayName={profile?.display_name || user.email || ''} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="p-1 text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <div className="flex-1">
            <div className="flex items-center gap-3"><h2 className="text-xl font-bold text-gray-900">{project.name}</h2><span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span></div>
            <p className="text-sm text-gray-500">{spaceLabel}{project.rough_area_m2 && ` · ${project.rough_area_m2}m²`}</p>
          </div>
          {project.status === 'completed' && <AnalyzeButton projectId={id} label="재분석" />}
        </div>

        {sketchUrl && <div className="mb-6 bg-white rounded-xl border border-gray-200 p-3"><img src={sketchUrl} alt="스케치" className="max-h-48 object-contain mx-auto rounded-lg" /></div>}

        {project.status === 'draft' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-4">스케치가 업로드되었습니다. 분석을 시작하세요.</p>
            <AnalyzeButton projectId={id} />
          </div>
        )}
        {project.status === 'analyzing' && (
          <>
            <AnalysisPoller projectId={id} />
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <RefreshCw size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
              <p className="text-gray-700 font-medium mb-2">AI 분석 중...</p>
              <p className="text-sm text-gray-500">약 15~30초 소요됩니다. 완료되면 자동으로 업데이트됩니다.</p>
            </div>
          </>
        )}
        {project.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium mb-2">분석 중 오류가 발생했습니다</p>
            <p className="text-sm text-red-600 mb-4">{project.error_message || '알 수 없는 오류'}</p>
            <AnalyzeButton projectId={id} label="다시 분석하기" />
          </div>
        )}
        {project.status === 'completed' && analysis && <ProjectResultTabs analysis={analysis} projectId={id} />}
      </main>
    </div>
  )
}
