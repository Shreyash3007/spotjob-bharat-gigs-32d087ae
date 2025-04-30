
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { JobCategory } from "@/types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PostJob = () => {
  const navigate = useNavigate();
  const { addJob, user, isAuthenticated } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as JobCategory,
    payAmount: "",
    payType: "hourly" as "hourly" | "daily" | "fixed",
    duration: "",
    location: {
      address: "",
      lat: 18.5204, // Default to Pune for demo
      lng: 73.8567
    }
  });

  // Category options with display names
  const categoryOptions = [
    { label: "Delivery", value: "delivery" },
    { label: "Tutoring", value: "tutoring" },
    { label: "Tech Work", value: "tech" },
    { label: "Babysitting", value: "babysitting" },
    { label: "Housekeeping", value: "housekeeping" },
    { label: "Events", value: "event" },
    { label: "Other", value: "other" }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value as JobCategory }));
  };

  const handlePayTypeChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      payType: value as "hourly" | "daily" | "fixed" 
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address: e.target.value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("You must be logged in to post a job");
      return;
    }
    
    if (!formData.title || !formData.description || !formData.category || !formData.payAmount || !formData.duration || !formData.location.address) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    addJob({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      pay: {
        amount: parseInt(formData.payAmount),
        type: formData.payType
      },
      duration: formData.duration,
      location: formData.location,
      status: "open"
    });
    
    toast.success("Job posted successfully!");
    navigate("/");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Math Tutor, Delivery Helper"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              onValueChange={handleCategoryChange}
              value={formData.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the job, requirements, and any other details"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payAmount">Pay Amount (₹)</Label>
              <Input
                id="payAmount"
                name="payAmount"
                type="number"
                min="0"
                placeholder="e.g., 500"
                value={formData.payAmount}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Pay Type</Label>
              <RadioGroup 
                defaultValue="hourly" 
                value={formData.payType}
                onValueChange={handlePayTypeChange}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="hourly" id="hourly" />
                  <Label htmlFor="hourly" className="cursor-pointer">Hourly</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="cursor-pointer">Daily</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="cursor-pointer">Fixed</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Job Duration</Label>
            <Input
              id="duration"
              name="duration"
              placeholder="e.g., 2 hours, 3 days, 1 week"
              value={formData.duration}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Location</Label>
            <Input
              id="address"
              name="address"
              placeholder="Enter full address"
              value={formData.location.address}
              onChange={handleAddressChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              For demonstration purposes, the location will be set near Pune.
            </p>
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PostJob;
