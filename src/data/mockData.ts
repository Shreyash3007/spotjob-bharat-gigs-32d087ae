
import { JobPost, User, JobApplication, JobFilter, JobCategory } from "../types";

// Mock user data
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Rahul Sharma",
    phone: "+919876543210",
    email: "rahul.sharma@example.com",
    location: {
      lat: 18.5204,
      lng: 73.8567
    },
    rating: 4.8,
    verified: true,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    skills: ["delivery", "driver"],
    verificationLevel: "phone",
  },
  {
    id: "user2",
    name: "Priya Patel",
    phone: "+917654321098",
    email: "priya.patel@example.com",
    location: {
      lat: 18.5314,
      lng: 73.8446
    },
    rating: 4.9,
    verified: true,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    skills: ["teaching", "math"],
    verificationLevel: "email",
  },
  {
    id: "user3",
    name: "Amit Kumar",
    phone: "+918765432109",
    email: "amit.kumar@example.com",
    location: {
      lat: 18.5097,
      lng: 73.8282
    },
    rating: 3.7,
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    skills: ["programming", "web"],
    verificationLevel: "none",
  },
  {
    id: "user4",
    name: "Neha Singh",
    phone: "+916543210987",
    email: "neha.singh@example.com",
    location: {
      lat: 18.5587,
      lng: 73.9154
    },
    rating: 4.5,
    verified: true,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    skills: ["childcare", "cooking"],
    verificationLevel: "phone",
  },
  {
    id: "user5",
    name: "Vijay Reddy",
    phone: "+915432109876",
    email: "vijay.reddy@example.com",
    location: {
      lat: 18.4743,
      lng: 73.8673
    },
    rating: 4.2,
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    skills: ["cleaning", "gardening"],
    verificationLevel: "none",
  }
];

// Mock job listings
export const mockJobs: JobPost[] = [
  {
    id: "job1",
    title: "Delivery Driver Needed",
    description: "Looking for a reliable delivery driver for food delivery within 5km radius. Must have own vehicle (bike/scooter). 3 hours shift during dinner time.",
    category: "delivery",
    skills: ["driving", "punctual", "local-knowledge"],
    pay: 400,
    payType: "hourly",
    duration: "3 hours",
    location: {
      lat: 18.5204,
      lng: 73.8567
    },
    postedBy: {
      id: "user2",
      name: "Priya Patel",
      verificationLevel: "email"
    },
    postedDate: "2023-07-01T10:00:00Z",
    timestamp: new Date("2023-07-01T10:00:00Z").getTime(),
    posterId: "user2",
    posterName: "Priya's Restaurant",
    posterRating: 4.7,
    posterVerified: true,
    posterAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "open"
  },
  {
    id: "job2",
    title: "Math Tutor for 10th Grade Student",
    description: "Need a qualified math tutor for my daughter who is in 10th grade. Focus on algebra and geometry. Twice a week, 1.5 hours each session. Looking for someone with teaching experience.",
    category: "tutoring",
    skills: ["math", "teaching", "patience"],
    pay: 600,
    payType: "hourly",
    duration: "Ongoing, 3 hours/week",
    location: {
      lat: 18.5314,
      lng: 73.8446
    },
    postedBy: {
      id: "user3",
      name: "Amit Kumar",
      verificationLevel: "none"
    },
    postedDate: "2023-07-02T14:30:00Z",
    timestamp: new Date("2023-07-02T14:30:00Z").getTime(),
    posterId: "user3",
    posterName: "Amit Kumar",
    posterRating: 4.2,
    posterVerified: false,
    posterAvatar: "https://randomuser.me/api/portraits/men/55.jpg",
    status: "open"
  },
  {
    id: "job3",
    title: "Web Developer Needed for Small Business Site",
    description: "Need a web developer to create a simple website for my small business. Should include 5-6 pages with contact form, gallery, and about us section. Looking for someone who can complete this within 1-2 weeks.",
    category: "tech",
    skills: ["html", "css", "javascript", "responsive-design"],
    pay: 15000,
    payType: "fixed",
    duration: "1-2 weeks",
    location: {
      lat: 18.5097,
      lng: 73.8282
    },
    postedBy: {
      id: "user5",
      name: "Vijay Reddy",
      verificationLevel: "none"
    },
    postedDate: "2023-07-03T09:15:00Z",
    timestamp: new Date("2023-07-03T09:15:00Z").getTime(),
    posterId: "user5",
    posterName: "Reddy Enterprises",
    posterRating: 3.9,
    posterVerified: true,
    status: "open"
  },
  {
    id: "job4",
    title: "Babysitter for Weekend Evening",
    description: "Looking for a babysitter for my 6-year-old son this Saturday evening from 6pm to 10pm. Experience with children required. References preferred.",
    category: "babysitting",
    skills: ["childcare", "responsible", "first-aid-knowledge"],
    pay: 500,
    payType: "hourly",
    duration: "4 hours, one-time",
    location: {
      lat: 18.5587,
      lng: 73.9154
    },
    postedBy: {
      id: "user1",
      name: "Rahul Sharma",
      verificationLevel: "phone"
    },
    postedDate: "2023-07-04T18:20:00Z",
    timestamp: new Date("2023-07-04T18:20:00Z").getTime(),
    posterId: "user1",
    posterName: "Rahul Sharma",
    posterRating: 4.8,
    posterVerified: true,
    posterAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "open"
  }
];

// Additional exports to make the mock data more complete
export const mockApplications: JobApplication[] = [
  {
    id: "app1",
    jobId: "job1",
    applicantId: "user3",
    message: "I have a reliable bike and know the area well. Available for evening shifts.",
    timestamp: "2023-07-01T15:45:00Z",
    status: "pending"
  },
  {
    id: "app2",
    jobId: "job2",
    applicantId: "user1",
    message: "I've tutored math for 3 years and have experience with 10th grade curriculum.",
    timestamp: "2023-07-02T16:10:00Z",
    status: "accepted"
  },
  {
    id: "app3",
    jobId: "job3",
    applicantId: "user2",
    message: "I've built several business websites with all the features you're looking for.",
    timestamp: "2023-07-03T11:30:00Z",
    status: "pending"
  }
];

// Initial filter state that can be used in components
export const initialJobFilter: JobFilter = {
  category: undefined,
  distance: 10,
  payMin: undefined,
  payMax: undefined,
  sortBy: "newest"
};

// Function to create a filtered version of the job listings based on filters
export const getFilteredJobs = (filters: JobFilter): JobPost[] => {
  let filtered = [...mockJobs];
  
  // Apply category filter
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(job => filters.category?.includes(job.category as JobCategory));
  }
  
  // Apply pay range filters
  if (filters.payMin !== undefined) {
    filtered = filtered.filter(job => {
      const payAmount = typeof job.pay === 'number' ? job.pay : 0;
      return payAmount >= (filters.payMin || 0);
    });
  }
  
  if (filters.payMax !== undefined) {
    filtered = filtered.filter(job => {
      const payAmount = typeof job.pay === 'number' ? job.pay : 0;
      return payAmount <= (filters.payMax || Infinity);
    });
  }
  
  // Apply sorting
  if (filters.sortBy === "newest") {
    filtered.sort((a, b) => {
      const dateA = new Date(a.postedDate).getTime();
      const dateB = new Date(b.postedDate).getTime();
      return dateB - dateA;
    });
  } else if (filters.sortBy === "pay_high_to_low") {
    filtered.sort((a, b) => {
      const payA = typeof a.pay === 'number' ? a.pay : 0;
      const payB = typeof b.pay === 'number' ? b.pay : 0;
      return payB - payA;
    });
  } else if (filters.sortBy === "pay_low_to_high") {
    filtered.sort((a, b) => {
      const payA = typeof a.pay === 'number' ? a.pay : 0;
      const payB = typeof b.pay === 'number' ? b.pay : 0;
      return payA - payB;
    });
  }
  
  return filtered;
};
