import { DEFAULT_MEMORY_CONFIG } from '../../memory/types.js'
import { createMemoryServer } from './http/server.js'

const samples = [
  {
    category: 'journal' as const,
    title: 'Journal — strong training week',
    text: 'Felt focused all week. Completed two hard sessions and slept well. Need to keep nutrition consistent before Saturday match.',
    importance: 7,
  },
  {
    category: 'goal' as const,
    title: 'Improve first touch under pressure',
    text: 'Goal for this season: receive and turn in tight spaces. Track progress weekly in training notes.',
    importance: 8,
  },
  {
    category: 'college_application' as const,
    title: 'Target schools — balanced list',
    text: 'Reach: MIT, Stanford. Target: Georgia Tech, UMich. Safety: in-state flagship. Start essay themes junior spring.',
    importance: 9,
  },
  {
    category: 'task' as const,
    title: 'Completed: Update activities resume',
    text: 'Logged leadership role in robotics club and summer research internship on the activities sheet.',
    importance: 5,
  },
  {
    category: 'soccer_training' as const,
    title: 'Training — rondo and finishing',
    text: '8v8 rondos, finishing from cutbacks, 6/10 intensity. Right foot felt sharp; left needs extra reps.',
    importance: 6,
  },
]

async function main() {
  const { embeddingService, repository } = createMemoryServer(DEFAULT_MEMORY_CONFIG)

  console.log('Seeding sample memories...')
  for (const sample of samples) {
    await embeddingService.store(sample)
  }
  console.log(`Done. ${repository.count()} memories in database.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
