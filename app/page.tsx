import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const html = readFileSync(join(process.cwd(), 'public', 'original-site.html'), 'utf8')
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
