import { Header } from '@/components/layout/Header';
import { Hero, HowItWorks, Pricing, ServiceArea, Footer } from '@/components/landing';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Pricing />
        <ServiceArea />
      </main>
      <Footer />
    </>
  );
}
