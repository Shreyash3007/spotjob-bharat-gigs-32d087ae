import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobCategory } from "@/types";
import { ArrowRight, Check, MapPin } from "lucide-react";

const Index = () => {
  const { filteredJobs, setJobFilters } = useApp();
  const [recentJobs, setRecentJobs] = useState(filteredJobs.slice(0, 3));

  useEffect(() => {
    // Sort by timestamp and get the most recent ones
    const sortedJobs = [...filteredJobs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    setRecentJobs(sortedJobs);
  }, [filteredJobs]);

  const categoryIcons: Record<JobCategory, string> = {
    delivery: "🚚",
    tutoring: "📚",
    tech: "💻",
    babysitting: "👶",
    housekeeping: "🧹",
    event: "🎭",
    other: "🛠️"
  };

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

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="hero-section -mx-4 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="animate-fade-in text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Find Local Gigs & Jobs Near You
            </h1>
            <p className="animate-slide-up mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              SpotJob connects you with flexible, short-term opportunities in your neighborhood. Find work or hire help with just a few taps.
            </p>
            <div className="animate-slide-up mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
            <div className="animate-slide-up delay-100 bg-white/70 backdrop-blur-sm rounded-xl border p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Jobs</div>
            </div>
            <div className="animate-slide-up delay-200 bg-white/70 backdrop-blur-sm rounded-xl border p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">2,000+</div>
              <div className="mt-1 text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="animate-slide-up delay-300 bg-white/70 backdrop-blur-sm rounded-xl border p-4 sm:p-6 text-center col-span-2 md:col-span-1">
              <div className="text-3xl sm:text-4xl font-bold text-primary">₹1M+</div>
              <div className="mt-1 text-sm text-muted-foreground">Paid Out</div>
            </div>
          </div>
        </section>
        
        {/* Browse by Category */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(categoryNames).map(([category, name], index) => (
              <Link 
                to="/swipe" 
                key={category}
                onClick={() => handleCategoryClick(category as JobCategory)}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-card flex flex-col items-center justify-center py-8 hover:border-primary/50">
                  <span className="text-4xl mb-3">{categoryIcons[category as JobCategory]}</span>
                  <span className="text-center font-medium">{name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Jobs */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Recent Jobs</h2>
            <Link to="/map" className="text-primary flex items-center text-sm font-medium hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentJobs.map((job, index) => (
              <Link 
                to={`/job/${job.id}`} 
                key={job.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="h-full hover:border-primary/30 transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <span className="text-2xl">{categoryIcons[job.category]}</span>
                    </div>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 inline" />
                      {job.location.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm mb-4 flex-1 text-muted-foreground">{job.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium text-primary">₹{job.pay.amount}</span>
                      <span className="text-xs bg-accent px-2 py-1 rounded">
                        {job.duration}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section>
          <div className="text-center mb-10">
            <h2 className="section-title">How SpotJob Works</h2>
            <p className="section-subtitle mx-auto">
              Find or post jobs in minutes with our simple process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card flex flex-col items-center text-center animate-fade-in">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="font-semibold text-xl mb-2">Find or Post Jobs</h3>
              <p className="text-muted-foreground">Browse available jobs or post your requirement in minutes</p>
            </div>
            <div className="feature-card flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="font-semibold text-xl mb-2">Connect Directly</h3>
              <p className="text-muted-foreground">Chat via WhatsApp or call to discuss details</p>
            </div>
            <div className="feature-card flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="font-semibold text-xl mb-2">Complete & Rate</h3>
              <p className="text-muted-foreground">Finish the job and build your profile with ratings</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary to-blue-600 text-white p-8 sm:p-12 rounded-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="mb-8 max-w-xl mx-auto text-white/90">
            Join hundreds of students, freelancers, and local businesses finding flexible work opportunities every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/swipe">
              <Button variant="secondary" size="lg">
                Find Jobs
              </Button>
            </Link>
            <Link to="/post-job">
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/10">
                Post a Job
              </Button>
            </Link>
          </div>
        </section>
        
        {/* Trust Symbols */}
        <section className="py-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">TRUSTED BY PROFESSIONALS ACROSS INDIA</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="h-6 w-24 bg-foreground/80 rounded"></div>
            <div className="h-6 w-28 bg-foreground/80 rounded"></div>
            <div className="h-6 w-24 bg-foreground/80 rounded"></div>
            <div className="h-6 w-20 bg-foreground/80 rounded"></div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
