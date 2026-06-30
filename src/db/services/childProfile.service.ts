import { db } from '../db'
import type { ChildProfile } from '../types'

export async function saveChildProfile(
  profile: Omit<ChildProfile, 'id'>
): Promise<number> {
  return db.childProfile.add(profile)
}

export async function getChildProfile(): Promise<ChildProfile | undefined> {
  return db.childProfile.toCollection().first()
}
