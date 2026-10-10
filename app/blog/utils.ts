import postIndex from '../../lib/generated/post-index.json'

export type Metadata = {
  title: string
  date: string
  summary: string
  image?: string
  category?: string
}

interface BlogPost {
  metadata: Metadata;
  slug: string;
  content: string;
}

export function getBlogPosts(): BlogPost[] {
  return postIndex.map((post) => ({
    metadata: {
      title: post.title,
      date: post.date,
      summary: post.summary || post.excerpt || '',
      image: post.image,
      category: post.category,
    },
    slug: post.slug.replace(/%20/g, ' '),
    content: '',
  }))
}

export function formatDate(date: string, includeRelative = false): string {
  const currentDate = new Date()
  const targetDate = new Date(date)

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  const daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
