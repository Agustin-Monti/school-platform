import { Hero } from '@/components/landing/hero'
import { Levels } from '@/components/landing/levels'
import { About } from '@/components/landing/about'
// import { Admissions } from '@/components/landing/admissions'
import { Testimonials } from '@/components/landing/testimonials'
import { Contact } from '@/components/landing/contact'

export default function Home() {
  return (
    <>
      <Hero />
      <Levels />
      <About />
      {/* <Admissions /> */}
      <Testimonials />
      <Contact />
    </>
  )
}