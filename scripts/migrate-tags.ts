import { PrismaClient, ClanTag } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Starting tag migration...')
  
  // First, let's get all clans with the old tags
  const clans = await prisma.clan.findMany({
    where: {
      tags: {
        hasSome: ['competitive' as ClanTag]
      }
    }
  })

  console.log(`Found ${clans.length} clans to update`)

  // Let's first just log what we found
  clans.forEach(clan => {
    console.log(`Found clan "${clan.name}" with tags: ${clan.tags.join(', ')}`)
  })

  // Update confirmation
  console.log('\nWould update these clans to use "hardcore" instead of "competitive"')
  
  // Uncomment these lines after confirming the logs look correct
  /*
  // Update each clan
  for (const clan of clans) {
    const newTags = clan.tags.map(tag => 
      tag === 'competitive' ? 'hardcore' as ClanTag : tag
    )

    await prisma.clan.update({
      where: { id: clan.id },
      data: { tags: newTags }
    })

    console.log(`Updated clan: ${clan.name}`)
  }

  console.log('Migration completed successfully!')
  */
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })