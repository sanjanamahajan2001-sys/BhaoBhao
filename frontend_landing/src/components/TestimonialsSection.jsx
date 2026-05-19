import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      rating: '5.0',
      text: `I was apprehensive about getting a groomer. How messy they would be or how their aptitude really is. Sanitization of the tools, their attitude towards my pup, how well can they actually handle my jumpy boy. Sayali was so patient with Sky. She slowly introduced him to each tool that she was going to use on him. Talking, kissing and hugging him throughout. It was like she Sky was her son ... The finish of how my toy poodle looked was fantastic. I have had Sky for 6 months and never seen him look so handsome. BhaoBhao is truly the best groomer for us. I didnt have to do anything other than exit the room as thats what distracted Sky. Having me around. Sayali is superb and the owner of BhaoBhao Shruti is very accommodating and understanding. Guys you have a customer for life.`,
      author: 'Vanita Chemburkar',
    },
    {
      rating: '5.0',
      text: `We had booked a grooming session with Bhao Bhao. It was wonderful.. they were very gentle and patient in handling my dog.. Really appreciate their professionalism, kindness, and the convenience of having them come home. My dog looks amazing and is so happy after the session. Thanks once again.😀`,
      author: 'Siddharth Chitalia',
    },
    {
      rating: '5.0',
      text: `I had a truly wonderful experience with Bhao Bhao! One of their skilled groomers, came home for my pet’s grooming session and did an outstanding job. It’s evident that their team is highly trained, as the level of service and professionalism was remarkable. My dog was cheerful and at ease throughout the session, which reflects the genuine care, patience, and expertise with which the grooming was handled. I especially appreciated that nothing was rushed...every step was carried out thoughtfully and with great attention to detail. The results were excellent, and the overall experience was worth every penny. I would wholeheartedly recommend Bhao Bhao to anyone seeking a reliable, professional, and caring grooming service for their pets.`,
      author: 'Yolande Mendes',
    },
    {
      rating: '5.0',
      text: `I booked a grooming session for my dog Misoki today and I’m so happy with the service. Sanju was amazing—very calm, friendly, and clearly loves dogs. Misoki looks great and was comfortable throughout. Thank you for such a lovely experience! Thank you Bhao Bhao team.. Great Idea and I love the services`,
      author: 'Minal More',
    },
    {
      rating: '5.0',
      text: `Had a lovely experience with BhaoBhao. Shruti understood all the needs over bhaobhao whatsapp while booking the appointment and groomer Ankit handled my dog very gently. Would surely recommend their service!`,
      author: 'Anirudh Ahlawat',
    },
    {
      rating: '5.0',
      text: `Bhaobhao transformed my hyperactive kiddo into a calm prince in under two hours that too at my home without going anywhere. The groomer arrived on time, fully equipped, and handled my dog with incredible patience and love. The bath, haircut, and nail trimming were all top-notch. Seeing my pet so relaxed and looking great made my day. Highly recommend Bhaobhao for their stellar, hassle-free grooming service!`,
      author: 'Gaurav Garg',
    },
  ];

  const circularTestimonials = useMemo(() => {
    // Create enough duplicates for seamless looping
    // Swiper needs at least slidesPerView * 2 + 2 slides for proper looping
    const duplications = 5; // Increased for better loop support
    return Array.from({ length: duplications }, (_, dupIdx) =>
      testimonials.map((item, originalIdx) => ({
        ...item,
        circularId: `${item.author}-${originalIdx}-${dupIdx}`,
      }))
    ).flat();
  }, [testimonials]);

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="testimonials-title">Real people, <span>Real love</span></h2>
        {/* <p className="testimonials-subtitle">Authentic experiences from our happy pet parents</p> */}
      </div>

      <div className="testimonials-carousel ">
        <Swiper
          className="swiper"
          modules={[Autoplay]}
          spaceBetween={32}
          loop={true}
          loopedSlides={6}
          speed={1000}
          allowTouchMove={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            stopOnLastSlide: false,
          }}
          breakpoints={{
            1400: {
              slidesPerView: 4,
              spaceBetween: 32,
              centeredSlides: false,
              loopedSlides: 4,
            },
            1200: {
              slidesPerView: 3,
              spaceBetween: 24,
              centeredSlides: false,
              loopedSlides: 3,
            },
            992: {
              slidesPerView: 2.5,
              spaceBetween: 20,
              centeredSlides: false,
              loopedSlides: 3,
            },
            768: {
              slidesPerView: 1.5,
              spaceBetween: 16,
              centeredSlides: false,
              loopedSlides: 2,
            },
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
              centeredSlides: false,
              loopedSlides: 2,
            },
          }}
        >
          {circularTestimonials.map((item) => (
            <SwiperSlide key={item.circularId}>
              <div className="testimonial-card">
                <div className="testimonial-rating">
                  <span className="score">{item.rating}</span>
                  <span className="star">★</span>
                </div>
                <p className="testimonial-text">“{item.text}”</p>
                <p className="testimonial-author">{item.author}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="testimonial-fade testimonial-fade-left" aria-hidden="true" />
        <div className="testimonial-fade testimonial-fade-right" aria-hidden="true" />
      </div>

      <div className="testimonial-dogs">
        <img src="./img10.png" alt="Happy pets" />
      </div>
    </section>
  );
};

export default TestimonialsSection;
