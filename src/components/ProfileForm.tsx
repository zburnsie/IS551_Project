import { useState, type FormEvent } from 'react'
import { useApp } from '../data/store'
import { readPhoto } from '../lib/photo'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Field, TextInput } from './fields'

/** Name, photo and dorm. Used in onboarding and in settings. */
export function ProfileForm({ submitLabel, onSaved }: { submitLabel: string; onSaved: () => void }) {
  const { me, updateProfile } = useApp()
  const [name, setName] = useState(me?.name ?? '')
  const [dorm, setDorm] = useState(me?.dorm ?? '')
  const [photo, setPhoto] = useState<string | null>(me?.photo ?? null)
  const [photoError, setPhotoError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    updateProfile({ name: name.trim(), dorm: dorm.trim(), photo })
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar user={{ id: me?.id ?? 'new', name: name || '?', photo }} size="lg" />
        <div className="flex flex-col gap-2">
          <span className="text-label">Photo</span>
          <div className="flex flex-wrap gap-2">
            <label className="text-label cursor-pointer rounded-md border border-rule bg-surface px-4 py-2 hover:bg-paper">
              {photo ? 'Change photo' : 'Upload a photo'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    setPhoto(await readPhoto(file))
                    setPhotoError('')
                  } catch {
                    setPhotoError('That file didn’t work. Try a JPG or PNG.')
                  }
                }}
              />
            </label>
            {photo && (
              <Button type="button" variant="secondary" onClick={() => setPhoto(null)}>Remove</Button>
            )}
          </div>
          <span className="text-body text-ink-muted">{photoError || 'Optional. Your initials show until you add one.'}</span>
        </div>
      </div>
      <Field label="Your name">
        <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" autoComplete="name" />
      </Field>
      <Field label="Dorm or building" hint="So roommates know they found the right room.">
        <TextInput value={dorm} onChange={(e) => setDorm(e.target.value)} placeholder="Heritage Halls, Building 12" />
      </Field>
      <div>
        <Button type="submit" disabled={!name.trim()}>{submitLabel}</Button>
      </div>
    </form>
  )
}
