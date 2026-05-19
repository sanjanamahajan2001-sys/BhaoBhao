'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  History,
  User,
  Scissors,
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Award,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  PawPrint,
  Users,
  Target,
  Zap,
  Globe,
  Headphones,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  // const quickActions = [
  //   {
  //     title: 'Book Service',
  //     description: 'Schedule a grooming appointment',
  //     icon: Calendar,
  //     action: () => navigate('/booking'),
  //     gradient: 'from-blue-600 via-purple-600 to-teal-600',
  //     iconBg: 'from-blue-500 to-purple-500',
  //   },
  //   {
  //     title: 'View History',
  //     description: 'See past appointments',
  //     icon: History,
  //     action: () => navigate('/history'),
  //     gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
  //     iconBg: 'from-emerald-500 to-teal-500',
  //   },
  //   {
  //     title: 'Manage Profile',
  //     description: 'Update pets and addresses',
  //     icon: User,
  //     action: () => navigate('/profile'),
  //     gradient: 'from-violet-600 via-purple-600 to-pink-600',
  //     iconBg: 'from-violet-500 to-purple-500',
  //   },
  // ];

  const features = [
    {
      icon: PawPrint,
      title: 'Expert Care',
      description: 'Certified professionals with 10+ years experience',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Fully insured with health protocols',
      color: 'green',
    },
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: 'Book appointments that fit your schedule',
      color: 'purple',
    },
    {
      icon: Heart,
      title: 'Loving Care',
      description: 'We treat your pets like our own family',
      color: 'pink',
    },
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Top-rated service with 4.9★ reviews',
      color: 'yellow',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer assistance',
      color: 'indigo',
    },
  ];

  const testimonials = [
    {
      name: 'Gaurangi Swapnil Sathe',
      pet: 'Parent of Bruno, the Golden Retriever',
      review:
        "Today We Completed Our Both Dog's Grooming And Hygiene Service...I absolutely loved Bhao Bhao Pet Grooming! :dog::dizzy: The groomer is amazing — he handled pets with so much love and patience... Thank you for making my pets look adorable and feel pampered :heart::nazar_amulet:",
      rating: 5,
    },
    {
      name: 'Gaurav Garg',
      pet: 'Parent of kiddo, the Poodle',
      review:
        'Bhaobhao transformed my hyperactive kiddo into a calm prince in under two hours that too at my home without going anywhere. The groomer arrived on time, fully equipped, and handled my dog with incredible patience and expertise. They used premium, pet-safe products that left his coat silky and smelling amazing for days. The entire process was stress-free no cages, no travel, no muzzle, no chains   just professional care at home. Booking the appintment was pleasant and seamless, with clear pricing and instant confirmation. My pup’s nails, ears, and even teeth were perfectly tended to. Bhaobhao is now my go-to for hassle-free, loving pet grooming!',
      rating: 5,
    },
    {
      name: 'Anirudh Ahlawat ',
      pet: 'Parent of Max, the Beagle',
      review:
        'Had a lovely experience with BhaoBhao. Shruti understood all the needs over bhaobhao whatsapp while booking the appointment and groomer Ankit handled my dog very gently. Would surely recommend their service!',
      rating: 5,
    },
    {
      name: 'Yolande Mendes',
      pet: 'Parent of Leo, the Labrador',
      review:
        'I had a truly wonderful experience with Bhao Bhao! One of their skilled groomers, came home for my pet’s grooming session and did an outstanding job. It’s evident that their team is highly trained, as the level of service and professionalism was remarkable. My dog was cheerful and at ease throughout the session, which reflects the genuine care, patience, and expertise with which the grooming was handled. I especially appreciated that nothing was rushed...every step was carried out thoughtfully and with great attention to detail. The results were excellent, and the overall experience was worth every penny. I would wholeheartedly recommend Bhao Bhao to anyone seeking a reliable, professional, and caring grooming service for their pets.',
      rating: 5,
    },
    {
      name: 'Kruti Desai',
      pet: 'Parent of Leo, the Labrador',
      review:
        'Booked a full grooming service for my dog upon recommendation of a friend. Leo is not a big fan of bath and trim but the way the Bhao Bhao executive managed him was excellent! I’m very happy with the results and all equipment used was very hygienic. Will surely recommend to my friends too',
      rating: 5,
    },
  ];

  const promiseFeatures = [
    {
      title: 'Expert Stylists',
      desc: 'Professionals with 8+ years of grooming experience ensuring top-quality service.',
      color: 'from-blue-500 to-purple-500',
      icon: Scissors,
    },
    {
      title: 'Gentle Care',
      desc: 'Curated with pet psychologists for stress-free grooming and a happy experience.',
      color: 'from-green-400 to-teal-500',
      icon: Heart,
    },
    {
      title: 'Mess-Free',
      desc: 'We clean thoroughly after every service to leave your space spotless.',
      color: 'from-pink-400 to-red-500',
      icon: Sparkles,
    },
    {
      title: 'Flexible',
      desc: 'Book or edit appointments easily — all in just a few clicks.',
      color: 'from-yellow-400 to-orange-500',
      icon: Calendar,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-50 to-blue-100 text-blue-600',
      green: 'from-green-50 to-green-100 text-green-600',
      purple: 'from-purple-50 to-purple-100 text-purple-600',
      pink: 'from-pink-50 to-pink-100 text-pink-600',
      yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
      indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* 🚀 Recruiter Demo Gateway Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden group">
        {/* Animated glow */}
        <div className="absolute inset-0 bg-indigo-500/5 opacity-50 blur-xl group-hover:opacity-80 transition-opacity"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ✨ Recruiter Sandbox Mode
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              One-Click Quick-Demo Gateway
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/70 max-w-xl">
              Explore the entire multi-portal full-stack ecosystem instantly. Select a role below to launch the respective portal in a new tab:
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                navigate('/booking');
              }}
              className="flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>👤 Customer Portal</span>
            </button>
            
            <a
              href={import.meta.env.VITE_GROOMER_PORTAL_URL || "https://bhaobhao-groomer.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            >
              <Scissors className="w-4 h-4" />
              <span>✂️ Groomer Portal</span>
            </a>
            
            <a
              href={import.meta.env.VITE_ADMIN_PORTAL_URL || "https://bhaobhao-admin.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95"
            >
              <Shield className="w-4 h-4" />
              <span>⚙️ Admin Portal</span>
            </a>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl"></div>
        <div className="absolute inset-0 hero-background-pattern opacity-30"></div>

        <div className="relative p-4 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-8">
              {/* <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                <img src="/logo.png" alt="Bhao Bhao" className="h-10 w-10" />
              </div> */}
              <div>
                <div className="text-white/90 text-2xl sm:text-3xl font-semibold">
                  Welcome,
                </div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {user?.full_name}!{' '}
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Professional in home
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                pet grooming
              </span>
            </h1>

            <p className="text-sm sm:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed  ">
              Step into a world where every grooming experience makes pets look
              and feel their absolute best
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/booking')}
                className="group bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 text-white sm:px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Calendar className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Book a grooming service</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={() => navigate('/history')}
                className="bg-white/10 backdrop-blur-sm text-white sm:px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3 border border-white/20"
              >
                <History className="h-6 w-6" />
                <span>View History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-40 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-20 w-16 h-16 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* ===================== Happy Customer Pets ===================== */}
      {/* ===================== Happy Customer Pets (Before / After Grid) ===================== */}
      {/* ===================== Happy Customer Pets (Before / After Grid - Fixed) ===================== */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden mt-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-40"></div>

        <div className="relative z-10 text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            From Woof to Wow
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sit back and watch our stylists create magic with their hands, as
            they curate the perfect look for your pets.
          </p>
        </div>

        {/* Before / After Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {[
            {
              before: '/49b5e278aafd96c895a806697e8297ee22f90b8e.png',
              after: '/49b5e278aafd96c895a806697e8297ee22f90b8e.png',
            },
            {
              before: '/49b5e278aafd96c895a806697e8297ee22f90b8e.png',
              after: '/49b5e278aafd96c895a806697e8297ee22f90b8e.png',
            },
            {
              before: '/49b5e278aafd96c895a806697e8297ee22f90b8e.png',
              after: '/49b5e278aafd96c895a806697e8297ee22f90b8e.png',
            },
          ].map((pair, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(pair.after)}
            >
              <div className="grid grid-cols-2">
                <img
                  src={pair.before}
                  alt={`Before ${index + 1}`}
                  className="w-full h-[230px] object-contain bg-white p-2"
                />
                <img
                  src={pair.after}
                  alt={`After ${index + 1}`}
                  className="w-full h-[230px] object-contain bg-white p-2"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white text-center py-2 font-semibold text-sm tracking-wide">
                Before <span className="mx-4 inline-block">➜</span> After
              </div>
            </div>
          ))}
        </div>

        {/* Image Popup Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-xl w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Selected Pet"
                className="w-full h-auto object-contain rounded-2xl bg-white"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <p className="text-gray-700 text-center font-medium">
          Join thousands of happy pet parents who trust{' '}
          <button
            onClick={() => navigate('/booking')}
            className="text-blue-600 font-semibold bg-transparent border-none p-0 cursor-pointer mr-1"
          >
            Bhao Bhao
          </button>
          for professional grooming transformations.
        </p>
      </div>

      {/* ===================== What Pet Parents Say ===================== */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 mt-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-14 text-gray-900">
            Real people, Real love
          </h2>

          <Swiper
            modules={[Autoplay, Pagination]}
            pagination={{ clickable: true }}
            loop={true}
            spaceBetween={35}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-14"
          >
            {testimonials.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between h-full min-h-[320px] border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  {/* Review Text with Vertical Scroll */}
                  <p className="text-gray-700 text-base leading-relaxed mb-4 overflow-y-auto h-[160px] pr-2 custom-scrollbar">
                    “{item.review}”
                  </p>

                  {/* Footer (Rating + Name) */}
                  <div>
                    <div className="flex mb-4">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">{item.pet}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="group relative bg-white rounded-3xl p-4 sm:p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

            <div
              className={`bg-gradient-to-r ${action.iconBg} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 shadow-lg`}
            >
              <action.icon className="h-8 w-8 text-white" />
            </div>

            <h3 className="font-bold text-gray-900 mb-3 text-xl relative z-10 group-hover:text-gray-800 transition-colors">
              {action.title}
            </h3>
            <p className="text-gray-600 relative z-10 mb-4 group-hover:text-gray-700 transition-colors">
              {action.description}
            </p>

            <div className="flex items-center text-teal-600 group-hover:text-teal-700 transition-colors relative z-10">
              <span className="font-medium mr-2">Get Started</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
        ))} */}
      </div>

      {/* Stats Dashboard */}
      {/* <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
          <div className="text-sm text-gray-600 mb-1">Completed Sessions</div>
          <div className="text-xs text-green-600 font-medium">
            +2 this month
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600 mb-1">Upcoming Bookings</div>
          <div className="text-xs text-blue-600 font-medium">Next: Jan 15</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <Award className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">4.9</div>
          <div className="text-sm text-gray-600 mb-1">Average Rating</div>
          <div className="text-xs text-purple-600 font-medium">
            Excellent service
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <PawPrint className="h-4 w-4 text-orange-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600 mb-1">Happy Pets</div>
          <div className="text-xs text-orange-600 font-medium">
            All registered
          </div>
        </div>
      </div> */}

      {/* ===================== Why Choose Us (Auto Scroll, No Line) ===================== */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-8 lg:p-12 relative overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>

        <div className="relative z-10">
          {/* Heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              The Bhao Bhao Promise
            </h2>
            <p className="text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Salon-like pet grooming within the comfort of your home. Experience
              professional care tailored to your pet’s comfort and peace of mind.
            </p>
          </div>

          {/* Carousel View with Autoplay */}
          <div className="max-w-6xl mx-auto">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              loop={true}
              speed={800} // Smooth transition
              autoplay={{
                delay: 3000, // Auto-advance every 3 seconds
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-14 px-4"
            >
              {promiseFeatures.map((feature, index) => (
                <SwiperSlide key={index} className="h-auto">
                  <div className="flex flex-col items-center text-center bg-white border border-gray-100 shadow-md rounded-3xl px-6 py-8 h-full hover:shadow-lg transition-all duration-300">
                    <div
                      className={`bg-gradient-to-br ${feature.color} p-5 rounded-2xl mb-5`}
                    >
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-teal-50 to-blue-50 rounded-full -translate-y-24 -translate-x-24 opacity-50"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Grooming Completed
                </h3>
                <p className="text-gray-600 text-sm">
                  Max&apos;s Premium Spa session was completed successfully
                </p>
                <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full inline-block mt-2">
                  2 days ago
                </div>
              </div>
            </div>

    
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Upcoming Appointment
                </h3>
                <p className="text-gray-600 text-sm">
                  Buddy&apos;s Basic Bath scheduled for Jan 15, 10:00 AM
                </p>
                <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full inline-block mt-2">
                  in 3 days
                </div>
              </div>
            </div>

        
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Review Submitted
                </h3>
                <p className="text-gray-600 text-sm">
                  You rated your last grooming session 5 stars
                </p>
                <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full inline-block mt-2">
                  1 week ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Company Stats */}
      {/* <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 rounded-3xl p-4 sm:p-8 lg:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 stats-background-pattern opacity-50"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
              <Globe className="h-5 w-5 text-blue-400" />
              <span className="text-white/90 font-medium">
                Trusted Nationwide
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Trusted by Pet Parents Everywhere
            </h2>
            <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto ">
              Join thousands of satisfied customers who trust us with their
              beloved pets
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
                15,000+
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Happy Pets Served
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                200+
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Expert Groomers
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                4.9★
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Average Rating
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-white/80 max-sm:text-sm group-hover:text-white transition-colors">
                Cities Covered
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Contact & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 rounded-3xl p-4 sm:p-8 border border-teal-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-3 rounded-xl">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
            </div>

            {/* ================================================================== */}
            {/* ✅ START: MODIFIED SECTION */}
            {/* ================================================================== */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                <Phone className="h-5 w-5 text-teal-600" />
                <a
                  href="tel:+917900118109"
                  className="text-gray-700 font-medium hover:text-teal-700 hover:underline transition-colors"
                >
                  +91-7900118109
                </a>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                <Mail className="h-5 w-5 text-teal-600" />
                <a
                  href="mailto:contact@bhaobaho.in"
                  className="text-gray-700 font-medium hover:text-teal-7Clickable00 hover:underline transition-colors"
                >
                  contact@bhaobaho.in
                </a>
              </div>
              {/* <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                <MapPin className="h-5 w-5 text-teal-600" />
                <span className="text-gray-700 font-medium">
                  Available in 10+ cities
                </span>
              </div> */}
            </div>
            {/* ================================================================== */}
            {/* ✅ END: MODIFIED SECTION */}
            {/* ================================================================== */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;