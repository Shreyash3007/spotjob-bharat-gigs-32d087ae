
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Create Your Profile",
      description: "Sign up and complete your profile with skills, experience, and verify your identity through our KYC process",
      color: "from-blue-500 to-primary"
    },
    {
      number: 2,
      title: "Browse Opportunities",
      description: "Explore available jobs near you through our interactive map or swipe through job cards",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: 3,
      title: "Apply & Connect",
      description: "Apply with one click and chat directly with employers to discuss details",
      color: "from-amber-500 to-orange-500"
    },
    {
      number: 4,
      title: "Complete & Get Paid",
      description: "Finish the job, receive payment, and build your reputation with positive reviews",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
            How SpotJob Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our simple four-step process connects you with opportunities or talent in minutes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 h-full">
                <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br", step.color, "flex items-center justify-center text-white text-xl font-bold mb-4")}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 -right-5 w-10 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-blue-500/10 border border-border text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-3">Enhanced Safety Through Verification</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            All users complete our KYC verification process, ensuring a trusted community of verified workers and employers.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
