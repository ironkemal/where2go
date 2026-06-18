import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setActiveAccommodation, deleteAccommodation } from '@/lib/accommodations'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { error } = await deleteAccommodation(id)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = await params

    if (body.is_active === true) {
      const { error } = await setActiveAccommodation(id)

      if (error) {
        return NextResponse.json({ error }, { status: 400 })
      }

      const { data: accommodation, error: fetchError } = await supabase
        .from('accommodations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 400 })
      }

      return NextResponse.json({ accommodation })
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
