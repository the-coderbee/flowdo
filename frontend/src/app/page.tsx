import { OnboardingHeader } from "@/components/features/onboarding/header"
import { HeroSection } from "@/components/features/landing/hero"
import { WhyFlowDoSection } from "@/components/features/landing/why-flowdo"
import { FeaturesSection } from "@/components/features/landing/features"
import { HowItWorksSection } from "@/components/features/landing/how-it-works"
import { PricingSection } from "@/components/features/landing/pricing"
import { TestimonialsSection } from "@/components/features/landing/testimonials"
import { FAQSection } from "@/components/features/landing/faq"
import { AboutSection } from "@/components/features/landing/about"
import { CTASection } from "@/components/features/landing/cta"
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
