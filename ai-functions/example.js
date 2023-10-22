import { AI } from './ai2.js'

const { ai, list, gpt } = AI()

for await (const item of list`synonyms for "fun"`) {
  console.log(item)
}


for await (const item of list`fun things to do in Miami`) {
  console.log(item)
}

const listBlogPosts = (count, topic) => list`${count} blog post titles about ${topic}`
const writeBlogPost = title => gpt`write a blog post in markdown starting with "# ${title}"`

async function* writeBlog(count, topic) {
  for await (const title of listBlogPosts(count, topic)) {
    const content = await writeBlogPost(title)
    yield { title, content }
  }
}

for await (const post of writeBlog(5, 'future of car sales')) {
  console.log({ post })
}