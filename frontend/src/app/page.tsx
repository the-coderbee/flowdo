import { OnboardingHeader } from "@/components/onboarding/header"
import { HeroSection } from "@/components/sections/hero"
import { WhyFlowDoSection } from "@/components/sections/why-flowdo"
import { FeaturesSection } from "@/components/sections/features"
import { HowItWorksSection } from "@/components/sections/how-it-works"
import { PricingSection } from "@/components/sections/pricing"
import { TestimonialsSection } from "@/components/sections/testimonials"
import { FAQSection } from "@/components/sections/faq"
import { AboutSection } from "@/components/sections/about"
import { CTASection } from "@/components/sections/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <OnboardingHeader />
      <main>
        <HeroSection />
        <WhyFlowDoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
