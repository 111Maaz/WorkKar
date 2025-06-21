import { Worker, Category } from '../types';

export const workers: Worker[] = [
  {
    id: 'w1',
    name: 'Jason Miller',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80',
    profession: 'Electrician',
    category: 'Electrical Services',
    rating: 4.8,
    numReviews: 124,
    hourlyRate: 35,
    location: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    distance: 2.3,
    tags: ['Residential', 'Commercial', 'Repairs', 'Installation'],
    bio: 'Licensed electrician with over 10 years of experience in residential and commercial projects. Specializing in troubleshooting, installations, and electrical repairs.',
    availability: true,
    joined: '2020-05-12T00:00:00Z',
    mobile: '+1 (555) 123-4567'
  },
  {
    id: 'w2',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80',
    profession: 'Plumber',
    category: 'Plumbing',
    rating: 4.7,
    numReviews: 98,
    hourlyRate: 40,
    location: {
      latitude: 37.7833,
      longitude: -122.4167
    },
    distance: 3.1,
    tags: ['Emergency Services', 'Pipe Repairs', 'Fixture Installation'],
    bio: 'Certified plumber specializing in emergency repairs, pipe installations, and general plumbing services for residential homes.',
    availability: true,
    joined: '2021-02-18T00:00:00Z',
    mobile: '+1 (555) 234-5678'
  },
  {
    id: 'w3',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80',
    profession: 'Carpenter',
    category: 'Carpentry',
    rating: 4.9,
    numReviews: 156,
    hourlyRate: 38,
    location: {
      latitude: 37.7695,
      longitude: -122.4143
    },
    distance: 1.8,
    tags: ['Custom Furniture', 'Woodworking', 'Cabinetry', 'Repairs'],
    bio: 'Master carpenter with expertise in custom furniture, cabinet making, and home renovations. Attention to detail and quality craftsmanship guaranteed.',
    availability: false,
    joined: '2019-11-05T00:00:00Z',
    mobile: '+1 (555) 345-6789'
  },
  {
    id: 'w4',
    name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&q=80',
    profession: 'House Cleaner',
    category: 'Cleaning Services',
    rating: 4.6,
    numReviews: 211,
    hourlyRate: 25,
    location: {
      latitude: 37.7835,
      longitude: -122.4096
    },
    distance: 2.5,
    tags: ['Deep Cleaning', 'Regular Maintenance', 'Move-in/Move-out'],
    bio: 'Professional house cleaner offering deep cleaning, regular maintenance, and specialized cleaning services. Eco-friendly products available upon request.',
    availability: true,
    joined: '2022-01-10T00:00:00Z',
    mobile: '+1 (555) 456-7890'
  },
  {
    id: 'w5',
    name: 'David Thompson',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop&q=80',
    profession: 'Landscaper',
    category: 'Landscaping',
    rating: 4.5,
    numReviews: 87,
    hourlyRate: 30,
    location: {
      latitude: 37.7949,
      longitude: -122.3984
    },
    distance: 4.2,
    tags: ['Garden Design', 'Lawn Care', 'Planting', 'Maintenance'],
    bio: 'Experienced landscaper offering garden design, lawn maintenance, and seasonal planting services. Creating beautiful outdoor spaces for over 8 years.',
    availability: true,
    joined: '2020-08-24T00:00:00Z',
    mobile: '+1 (555) 567-8901'
  },
  {
    id: 'w6',
    name: 'Aisha Patel',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&q=80',
    profession: 'Tutor',
    category: 'Education',
    rating: 4.9,
    numReviews: 103,
    hourlyRate: 45,
    location: {
      latitude: 37.7791,
      longitude: -122.4200
    },
    distance: 1.5,
    tags: ['Mathematics', 'Science', 'Test Prep', 'K-12'],
    bio: 'Certified teacher with a Master\'s in Education. Specializing in math and science tutoring for K-12 students. Personalized learning plans for each student.',
    availability: true,
    joined: '2021-09-02T00:00:00Z',
    mobile: '+1 (555) 678-9012'
  }
];

export const categories: Category[] = [
  {
    id: 'c1',
    name: 'Electrical Services',
    icon: 'zap',
    count: 78
  },
  {
    id: 'c2',
    name: 'Plumbing',
    icon: 'droplet',
    count: 63
  },
  {
    id: 'c3',
    name: 'Carpentry',
    icon: 'hammer',
    count: 51
  },
  {
    id: 'c4',
    name: 'Cleaning Services',
    icon: 'sparkles',
    count: 112
  },
  {
    id: 'c5',
    name: 'Landscaping',
    icon: 'tree',
    count: 42
  },
  {
    id: 'c6',
    name: 'Education',
    icon: 'book',
    count: 36
  },
  {
    id: 'c7',
    name: 'Auto Repair',
    icon: 'car',
    count: 29
  },
  {
    id: 'c8',
    name: 'Pet Care',
    icon: 'dog',
    count: 44
  }
];
