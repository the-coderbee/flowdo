"use client"

import { motion } from "framer-motion"
import { Check, Crown, Zap, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for getting started with productivity",
    price: "$0",
    period: "forever",
    icon: Zap,
    features: [
      "Up to 50 tasks",
      "Basic Pomodoro timer",
      "3 project groups",
      "Basic progress tracking",
      "Mobile app access",
      "Email support"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    description: "For individuals who want to maximize their productivity",
    price: "$8",
    period: "per month",
    icon: Crown,
    features: [
      "Unlimited tasks",
      "Advanced Pomodoro settings",
      "Unlimited project groups",
      "Detailed analytics & insights",
      "Team collaboration (up to 5 members)",
      "Priority support",
      "Custom themes",
      "Calendar integration",
      "Export & backup options"
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "Team",
    description: "For teams that want to boost collective productivity",
    price: "$15",
    period: "per user/month",
    icon: Users,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Advanced team analytics",
      "Team Pomodoro sessions",
      "Project templates",
      "Admin controls & permissions",
      "SSO integration",
      "Advanced reporting",
      "Dedicated account manager"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    popular: false
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-accent/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Productivity Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core productivity features.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-card border rounded-xl p-8 ${
                plan.popular 
                  ? "border-primary shadow-lg scale-105" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <plan.icon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.buttonVariant} 
                className="w-full"
                size="lg"
                asChild
              >
                <Link href="/auth/register">
                  {plan.buttonText}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Cancel anytime
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              No setup fees
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              24/7 support
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}