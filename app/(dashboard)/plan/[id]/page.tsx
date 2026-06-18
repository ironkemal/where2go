import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TripPlan, TripPlanData } from '@/types/database'
import PlanPageClient from './PlanPageClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlanPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: planRaw, error } = await (supabase as any)
    .from('trip_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !planRaw) notFound()

  const plan = planRaw as TripPlan

  if (!plan.plan_data) notFound()

  const planData = plan.plan_data as TripPlanData

  return <PlanPageClient plan={plan} planData={planData} />
}
