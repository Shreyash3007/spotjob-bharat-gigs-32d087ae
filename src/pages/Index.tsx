
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
import { ArrowRight } from "lucide-react";

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
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8 px-4 bg-gradient-to-br from-spotjob-lightPurple to-white rounded-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-spotjob-purple mb-4">
            Find Local Gigs & Jobs Near You
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
            SpotJob connects you with flexible, short-term opportunities in your neighborhood. Find work or hire help with just a few taps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/swipe">
              <Button size="lg">
                Find Jobs
              </Button>
            </Link>
            <Link to="/post-job">
              <Button variant="outline" size="lg">
                Post a Job
              </Button>
            </Link>
          </div>
        </section>

        {/* Browse by Category */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(categoryNames).map(([category, name]) => (
              <Link 
                to="/swipe" 
                key={category}
                onClick={() => handleCategoryClick(category as JobCategory)}
              >
                <div className="flex flex-col items-center p-4 bg-white hover:bg-gray-50 border rounded-lg transition-colors">
                  <span className="text-3xl mb-2">{categoryIcons[category as JobCategory]}</span>
                  <span className="text-center font-medium">{name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Jobs */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Jobs</h2>
            <Link to="/map" className="text-spotjob-purple flex items-center text-sm font-medium hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentJobs.map((job) => (
              <Link to={`/job/${job.id}`} key={job.id}>
                <Card className="h-full hover:border-spotjob-purple/30 transition-colors hover:shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-start justify-between">
                      <div className="text-lg">{job.title}</div>
                      <span className="text-2xl">{categoryIcons[job.category]}</span>
                    </CardTitle>
                    <CardDescription className="truncate">
                      {job.location.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm mb-2 flex-1">{job.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium text-spotjob-purple">₹{job.pay.amount}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
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
          <div className="mb-4">
            <h2 className="text-xl font-bold">How SpotJob Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border text-center">
              <div className="w-12 h-12 bg-spotjob-lightPurple text-spotjob-purple rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Find or Post Jobs</h3>
              <p className="text-gray-600">Browse available jobs or post your requirement in minutes</p>
            </div>
            <div className="bg-white p-6 rounded-lg border text-center">
              <div className="w-12 h-12 bg-spotjob-lightPurple text-spotjob-purple rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">Connect Directly</h3>
              <p className="text-gray-600">Chat via WhatsApp or call to discuss details</p>
            </div>
            <div className="bg-white p-6 rounded-lg border text-center">
              <div className="w-12 h-12 bg-spotjob-lightPurple text-spotjob-purple rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Complete & Rate</h3>
              <p className="text-gray-600">Finish the job and build your profile with ratings</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-spotjob-purple text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
          <p className="mb-6 max-w-xl mx-auto">
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
      </div>
    </Layout>
  );
};

export default Index;
