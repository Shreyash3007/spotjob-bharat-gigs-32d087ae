
import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  index,
}) => {
  return (
    <motion.div
      className="bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
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
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-primary/20">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
      
      <div className="mb-4 flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      
      <p className="text-muted-foreground italic">"<span className="not-italic text-foreground">{testimonial.content}</span>"</p>
    </motion.div>
  );
};

export default TestimonialCard;
