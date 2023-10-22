import { AI } from './proxy.js'

const { ai, list, gpt } = AI()

for await (const item of list`synonyms for "fun"`) {
  console.log(item)
}


// for await (const item of list`fun things to do in Miami`) {
//   console.log(item)
// }

// const listBlogPosts = (count, topic) => list`${count} blog post titles about ${topic}`
// const writeBlogPost = title => gpt`write a blog post in markdown starting with "# ${title}"`

// async function* writeBlog(count, topic) {
//   for await (const title of listBlogPosts(count, topic)) {
//     const contentPromise = writeBlogPost(title).then(content => {
//       console.log({ title, content })
//       return { title, content }
//     })
//     yield { title, contentPromise }
//   }
// }

// for await (const post of writeBlog(3, 'future of car sales')) {
//   console.log({ post })
// }

const product = await ai.categorizeProduct({ domain: 'OpenSaaS.org' }, { 
  productType: 'App | API | Marketplace | Platform | Packaged Service | Professional Service | Website',
  customer: 'ideal customer profile in 10-20 words',
  solution: 'describe the offer in 10-20 words',
  description: 'website meta description',
})

console.log({ product })