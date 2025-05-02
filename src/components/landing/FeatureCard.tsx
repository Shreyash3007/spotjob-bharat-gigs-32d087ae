
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientClass: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  gradientClass,
  index,
}) => {
  return (
    <motion.div
      className="feature-card rounded-xl bg-card/50 border border-border hover:border-primary/30 p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="relative z-10">
        <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br", gradientClass, "flex items-center justify-center text-white mb-4")}>
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
    </motion.div>
  );
};

export default FeatureCard;
