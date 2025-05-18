
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { useJobs } from "@/context/JobContext";
import { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobCategory } from "@/types";
import { ArrowRight, MapPin, Check, Clock, Award, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const CategoryIcon = ({ category }: { category: JobCategory }) => {
  const categoryIcons: Record<JobCategory, string> = {
    delivery: "🚚",
    tutoring: "📚",
    tech: "💻",
    babysitting: "👶",
    housekeeping: "🧹",
    event: "🎭",
    other: "🛠️"
  };
  
  return <span className="text-2xl">{categoryIcons[category]}</span>;
};

const Index = () => {
  const { jobs, filteredJobs, setJobFilters } = useJobs();
  const { user } = useAuth();
  
  // Get recent jobs sorted by date
  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
      .slice(0, 3);
  }, [jobs]);

  // If user is not authenticated, redirect to landing page
  if (!user) {
    return <Navigate to="/" />;
  }

  const categoryNames: Record<JobCategory, string> = {
    delivery: "Delivery",
    tutoring: "Tutoring",
    tech: "Tech Work",
    babysitting: "Babysitting",
    housekeeping: "Housekeeping",
    event: "Events",
    other: "Other Jobs"
  };

  const handleCategoryClick = (category: JobCategory) => {
    setJobFilters({ category: [category] });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <PageLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <motion.section 
          className="bg-card rounded-xl border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 sm:p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Find Local Gigs & Jobs Near You
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                SpotJob connects you with flexible, short-term opportunities in your neighborhood. Find work or hire help with just a few taps.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/swipe">
                  <Button size="lg" className="w-full sm:w-auto">
                    Find Jobs
                  </Button>
                </Link>
                <Link to="/post-job">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Potential Earnings Cards */}
            <motion.div 
              className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Quick Tasks</h3>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">₹500 - 1,500</div>
                <div className="text-sm text-muted-foreground">Potential earnings per day</div>
              </motion.div>
              
              <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Skilled Services</h3>
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">₹1,000 - 3,000</div>
                <div className="text-sm text-muted-foreground">Potential earnings per day</div>
              </motion.div>
              
              <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Professional Work</h3>
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">₹2,500 - 5,000+</div>
                <div className="text-sm text-muted-foreground">Potential earnings per day</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        
        {/* Browse by Category */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
          </div>
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {Object.entries(categoryNames).map(([category, name]) => (
              <motion.div key={category} variants={item}>
                <Link 
                  to="/swipe" 
                  onClick={() => handleCategoryClick(category as JobCategory)}
                >
                  <Card className="hover:border-primary/50 transition-colors h-full hover:shadow-md">
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <CategoryIcon category={category as JobCategory} />
                      <span className="mt-2 font-medium">{name}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Recent Jobs */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Jobs</h2>
            <Link to="/map" className="text-primary flex items-center text-sm font-medium hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <motion.div key={job.id} variants={item}>
                  <Link to={`/job/${job.id}`}>
                    <Card className="h-full hover:border-primary/30 transition-colors hover:shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CategoryIcon category={job.category as JobCategory} />
                        </div>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 inline" />
                          {typeof job.location === 'object' && job.location && 'address' in job.location 
                            ? String(job.location.address) 
                            : "Location unavailable"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm mb-4 text-muted-foreground">{job.description}</p>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-medium text-primary">
                            ₹{typeof job.pay === 'number' 
                              ? job.pay 
                              : (typeof job.pay === 'object' && job.pay && 'amount' in job.pay) 
                                ? String(job.pay.amount) 
                                : 'N/A'}
                          </span>
                          <span className="text-xs bg-accent px-2 py-1 rounded-full">
                            {job.payType === 'hourly' ? `${job.duration} hours` : job.duration}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 bg-accent/20 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No recent jobs available. Check back soon!</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* How it Works */}
        <section className="bg-accent/30 rounded-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">How SpotJob Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find or post jobs in minutes with our simple process
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Find or Post Jobs</h3>
              <p className="text-muted-foreground">Browse available jobs or post your requirement in minutes</p>
            </motion.div>
            <motion.div variants={item} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">Connect Directly</h3>
              <p className="text-muted-foreground">Chat via WhatsApp or call to discuss details</p>
            </motion.div>
            <motion.div variants={item} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Complete & Rate</h3>
              <p className="text-muted-foreground">Finish the job and build your profile with ratings</p>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Index;
