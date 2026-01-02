import { mdxComponents } from '../components/mdxComponents'
import HomeMDX from './Home.mdx'

export function Home() {
  return (
    <div className="home">
      <HomeMDX components={mdxComponents} />
    </div>
  )
}
