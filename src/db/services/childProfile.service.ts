import { db } from '../db'
import type { ChildProfile } from '../types'

export async function saveChildProfile(
  profile: Omit<ChildProfile, 'id'>
): Promise<number> {
  return db.childProfile.add(profile) as Promise<number>
}

export async function updateChildProfile(
  id: number,
  profile: Omit<ChildProfile, 'id'>
): Promise<void> {
  await db.childProfile.put({ ...profile, id })
}

export async function getChildProfile(): Promise<ChildProfile | undefined> {
  return db.childProfile.toCollection().first()
}
