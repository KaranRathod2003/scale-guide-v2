import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://scale-guide-v2.vercel.app/',
      lastModified: new Date(),
    },
  ]
}