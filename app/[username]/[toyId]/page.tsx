import { notFound } from 'next/navigation'
import { PublicToyResponse } from '@/types'
import { PublicEventClient } from './PublicEventClient'

interface Props {
  params: Promise<{ username: string; toyId: string }>
  searchParams: Promise<{ token?: string }>
}

async function fetchPublicEvent(username: string, toyId: string): Promise<PublicToyResponse | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/events/${username}/${toyId}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { username, toyId } = await params
  const event = await fetchPublicEvent(username, toyId)
  return {
    title: event ? `${event.title} | Toyla.app` : 'Приглашение | Toyla.app',
    description: event?.description ?? 'Вас приглашают на мероприятие',
    openGraph: {
      title: event?.title,
      description: event?.description,
    },
  }
}

export default async function PublicEventPage({ params, searchParams }: Props) {
  const { username, toyId } = await params
  const { token } = await searchParams

  const event = await fetchPublicEvent(username, toyId)
  if (!event) notFound()

  return <PublicEventClient event={event} rsvpToken={token} />
}
