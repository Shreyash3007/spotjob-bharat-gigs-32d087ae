
import { JobPost, User } from "../types";

// Central Pune coordinates as base
const PUNE_CENTER = {
  lat: 18.5204, 
  lng: 73.8567
};

// Generate random coordinates within a certain radius of Pune
const getRandomLocation = (radiusKm: number = 5) => {
  // 0.01 degrees is roughly 1km
  const degreeOffset = (radiusKm / 100) * (Math.random() - 0.5);
  return {
    lat: PUNE_CENTER.lat + degreeOffset,
    lng: PUNE_CENTER.lng + degreeOffset * 1.5,
  };
};

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Arjun Sharma",
    phone: "+91 9876543210",
    location: PUNE_CENTER,
    rating: 4.8,
    verified: true,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    id: "u2",
    name: "Priya Patel",
    phone: "+91 8765432109",
    location: getRandomLocation(2),
    rating: 4.5,
    verified: true,
    avatar: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    id: "u3",
    name: "Rahul Verma",
    phone: "+91 7654321098",
    location: getRandomLocation(3),
    rating: 4.2,
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    id: "u4",
    name: "Meera Kapoor",
    phone: "+91 6543210987",
    location: getRandomLocation(4),
    rating: 4.9,
    verified: true,
    avatar: "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    id: "u5",
    name: "Vikram Singh",
    phone: "+91 5432109876",
    location: getRandomLocation(2.5),
    rating: 3.8,
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/5.jpg"
  }
];

// Function to get a randomized location address
const getAddress = () => {
  const streets = [
    "MG Road", "FC Road", "JM Road", "Baner Road", "Aundh Road", 
    "Karve Road", "SB Road", "Laxmi Road", "Deccan", "Kothrud"
  ];
  const localities = [
    "Shivajinagar", "Kothrud", "Aundh", "Baner", "Viman Nagar", 
    "Koregaon Park", "Camp", "Hadapsar", "Kharadi", "Hinjewadi"
  ];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const locality = localities[Math.floor(Math.random() * localities.length)];
  return `${Math.floor(Math.random() * 100) + 1}, ${street}, ${locality}, Pune`;
};

// Function to generate a random job post
const generateRandomJob = (id: string): JobPost => {
  const jobTypes = [
    { title: "Food Delivery Partner", category: "delivery" },
    { title: "Mathematics Tutor", category: "tutoring" },
    { title: "Website Developer", category: "tech" },
    { title: "Evening Babysitter", category: "babysitting" },
    { title: "House Cleaner", category: "housekeeping" },
    { title: "Event Support Staff", category: "event" },
    { title: "Gardening Helper", category: "other" },
  ];
  
  const jobTypeIndex = Math.floor(Math.random() * jobTypes.length);
  const selectedJob = jobTypes[jobTypeIndex];
  
  const descriptions = [
    `Looking for a reliable ${selectedJob.title.toLowerCase()} to help with daily tasks.`,
    `Need an experienced ${selectedJob.title.toLowerCase()} for a short assignment.`,
    `Urgent requirement for a ${selectedJob.title.toLowerCase()} in my neighborhood.`,
    `Seeking a skilled ${selectedJob.title.toLowerCase()} for a one-time project.`,
    `Part-time ${selectedJob.title.toLowerCase()} needed for a few hours daily.`
  ];
  
  const durations = ["1 day", "2-3 days", "1 week", "2 weeks", "1 month"];
  const payTypes = ["hourly", "fixed", "daily"] as const;
  
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const location = getRandomLocation();
  
  return {
    id,
    title: selectedJob.title,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    location: {
      lat: location.lat,
      lng: location.lng,
      address: getAddress(),
    },
    pay: {
      amount: Math.floor(Math.random() * 800) + 200, // Random pay between 200-1000 INR
      type: payTypes[Math.floor(Math.random() * payTypes.length)],
    },
    category: selectedJob.category as any,
    duration: durations[Math.floor(Math.random() * durations.length)],
    posterId: randomUser.id,
    posterName: randomUser.name,
    posterRating: randomUser.rating,
    posterVerified: randomUser.verified,
    posterAvatar: randomUser.avatar,
    timestamp: Date.now() - Math.floor(Math.random() * 604800000), // Random timestamp within the last week
    status: "open",
  };
};

// Generate 20 random job posts
export const mockJobs: JobPost[] = Array.from({ length: 20 }, (_, i) =>
  generateRandomJob(`job-${i + 1}`)
);

export const currentUser: User = {
  id: "current-user",
  name: "Ravi Kumar",
  phone: "+91 9998887776",
  location: PUNE_CENTER,
  rating: 4.6,
  verified: true,
  avatar: "https://randomuser.me/api/portraits/men/36.jpg"
};
