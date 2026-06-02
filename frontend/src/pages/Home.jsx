import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";
// import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

function Home () {
  return (
    <>
      <Navbar />
      <Hero />
      <Testimonials/>
      {/* <Newsletter /> */}
      <Footer/>
    </>
  );
}

export default Home;