import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, 
  Play, 
  Users, 
  Globe, 
  Star, 
  Award,
  Rocket,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LandingHeader } from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import FeatureCard from "@/components/landing/FeatureCard";
import TestimonialCard from "@/components/landing/TestimonialCard";
import HowItWorksSection from "@/components/landing/HowItWorksSection";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [hasScrolled, setHasScrolled] = useState(false);

  // If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/home" />;
  }

  // Features data
  const features = [
    {
      title: "Find Jobs Near You",
      description: "Discover flexible gigs and jobs in your neighborhood with our advanced location-based search",
      icon: <Globe className="w-6 h-6 stroke-current" strokeWidth={1.5} />,
      color: "bg-gradient-to-br from-blue-500 to-cyan-400"
    },
    {
      title: "Easy Application",
      description: "Apply with a single swipe and connect directly with employers - no lengthy forms required",
      icon: <ArrowRight className="w-6 h-6 stroke-current" strokeWidth={1.5} />,
      color: "bg-gradient-to-br from-purple-500 to-indigo-600"
    },
    {
      title: "Verified Profiles",
      description: "All users go through our KYC verification to ensure safety and trust within our community",
      icon: <Award className="w-6 h-6 stroke-current" strokeWidth={1.5} />,
      color: "bg-gradient-to-br from-amber-500 to-orange-400"
    },
    {
      title: "Real-time Matching",
      description: "Our intelligent algorithm matches your skills with the perfect opportunities",
      icon: <TrendingUp className="w-6 h-6 stroke-current" strokeWidth={1.5} />,
      color: "bg-gradient-to-br from-green-500 to-emerald-400"
    },
    {
      title: "Community Support",
      description: "Join a thriving community of freelancers and employers helping each other succeed",
      icon: <Users className="w-6 h-6 stroke-current" strokeWidth={1.5} />,
      color: "bg-gradient-to-br from-pink-500 to-rose-400"
    },
    {
      title: "Innovative Solutions",
      description: "We're constantly evolving with new features to make finding jobs easier than ever",
      icon: <Lightbulb className="w-6 h-6 stroke-current" strokeWidth={1.5} />,
      color: "bg-gradient-to-br from-violet-500 to-purple-400"
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Freelance Designer",
      image: "https://source.unsplash.com/200x200/?portrait,person",
      content: "SpotJob changed my career! I found consistent design work in my neighborhood and built a client base that now keeps me busy full-time.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Café Owner",
      image: "https://source.unsplash.com/200x200/?woman,portrait",
      content: "As a small business owner, I needed reliable part-time staff quickly. SpotJob helped me find verified local candidates within hours!",
      rating: 5
    },
    {
      name: "Michael Wong",
      role: "College Student",
      image: "https://source.unsplash.com/200x200/?man,student",
      content: "The flexibility of gigs on SpotJob perfectly fits my class schedule. I can earn while studying without committing to fixed hours.",
      rating: 4
    },
  ];

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute -top-[40vh] -left-[10vw] w-[70vw] h-[70vh] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-blob"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-[40vh] -right-[20vw] w-[80vw] h-[80vh] bg-blue-500/20 rounded-full blur-[120px] opacity-40 animate-blob"
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 30, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-[100vh] -left-[20vw] w-[70vw] h-[70vh] bg-purple-500/20 rounded-full blur-[120px] opacity-30 animate-blob"
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 4
          }}
        />
      </div>

      {/* Header */}
      <LandingHeader hasScrolled={hasScrolled} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div 
              className="flex-1 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.span 
                className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Launching the future of local work
              </motion.span>
              
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Connect with Local Jobs & Opportunities
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                SpotJob connects people with flexible work opportunities in their neighborhood. 
                Find local gigs or post jobs with ease - all through our verified, secure platform.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  size="lg" 
                  className="btn-shimmer bg-gradient-to-r from-primary to-blue-600 text-white text-lg py-6 px-8 h-auto"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
                </Button>
                
                <Button 
                  onClick={() => navigate('/auth?mode=login')} 
                  variant="outline" 
                  size="lg" 
                  className="text-lg py-6 px-8 h-auto group border-foreground/20"
                >
                  I Already Have An Account
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-xl transform rotate-3"></div>
                <div className="rounded-3xl overflow-hidden shadow-xl relative z-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">Our Mission</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connecting talent with opportunities</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <path d="m9 11 3 3L22 4"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-1">For Job Seekers</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Find verified local opportunities that match your skills and availability</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-1">For Employers</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Access a pool of pre-vetted local talent for your short or long-term needs</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800/30 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-1">Trust & Security</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Our verification process ensures safety and reliability for everyone</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Join our growing community</p>
                          <p className="font-medium text-gray-900 dark:text-white">Connect with local employers today</p>
                        </div>
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">J</div>
                          <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">S</div>
                          <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">M</div>
                          <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">R</div>
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-xs font-bold">+</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Animated elements */}
                <motion.div 
                  className="absolute -right-6 -top-6 bg-purple-500 text-white p-3 rounded-xl shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Users className="h-5 w-5" strokeWidth={1.5} />
                  <p className="text-xs font-medium mt-1">Fast Matching</p>
                </motion.div>
                
                <motion.div 
                  className="absolute -left-10 top-32 bg-blue-500 text-white p-3 rounded-xl shadow-lg"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <Star className="h-5 w-5" strokeWidth={1.5} />
                  <p className="text-xs font-medium mt-1">Quality Jobs</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div 
              className="stat-card flex flex-col items-center justify-center p-6 text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</span>
              <span className="text-sm text-muted-foreground">Secure Platforms</span>
            </motion.div>
            
            <motion.div 
              className="stat-card flex flex-col items-center justify-center p-6 text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="text-3xl sm:text-4xl font-bold text-primary mb-2">24/7</span>
              <span className="text-sm text-muted-foreground">Support Available</span>
            </motion.div>
            
            <motion.div 
              className="stat-card flex flex-col items-center justify-center p-6 text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="text-3xl sm:text-4xl font-bold text-primary mb-2">₹15-20k</span>
              <span className="text-sm text-muted-foreground">Avg. Monthly Potential</span>
            </motion.div>
            
            <motion.div 
              className="stat-card flex flex-col items-center justify-center p-6 text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="text-3xl sm:text-4xl font-bold text-primary mb-2">48h</span>
              <span className="text-sm text-muted-foreground">Fast Hiring Process</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
              Why Choose SpotJob?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our platform is designed to make finding and posting local jobs effortless, secure, and rewarding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                gradientClass={feature.color}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join thousands of satisfied users who have transformed the way they find work and talent
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={index}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-600 p-10 sm:p-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 2
                }}
              ></motion.div>
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform How You Work?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
                Whether you're looking for flexible gigs or seeking talented individuals for your business,
                SpotJob connects you with verified opportunities in your local area.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  variant="secondary" 
                  size="lg" 
                  className="text-primary font-medium text-lg h-auto py-6 px-8"
                >
                  Sign Up Now <Rocket className="ml-2 h-5 w-5" strokeWidth={1.5} />
                </Button>
                
                <Button 
                  onClick={() => navigate('/map')} 
                  variant="outline" 
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/10 text-lg h-auto py-6 px-8"
                >
                  Explore Jobs Map <Globe className="ml-2 h-5 w-5" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
