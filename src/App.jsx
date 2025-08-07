import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaUsers, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 opacity-90 animate-gradient-shift"></div>
        
        {/* Navigation */}
        <nav className="relative z-10 py-6 px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaMapMarkedAlt className="text-green-500 text-2xl" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              OffroadX
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link to="/features" className="text-gray-300 hover:text-green-400 transition">Features</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-green-400 transition">Pricing</Link>
            <Link to="/events" className="text-gray-300 hover:text-green-400 transition">Events</Link>
            <Link to="/about" className="text-gray-300 hover:text-green-400 transition">About</Link>
          </div>
          <div>
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-2 rounded-full hover:from-green-500 hover:to-green-600 transition-all shadow-lg hover:shadow-green-500/20"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 py-32 px-6 lg:px-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Revolutionizing
            </span> Offroad Adventures
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            The ultimate SaaS platform for offroad event management, participant engagement, and adventure analytics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/demo" 
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-white/20"
            >
              Request Demo
            </Link>
            <Link 
              to="/pricing" 
              className="border-2 border-green-500 text-green-400 px-8 py-4 rounded-full font-bold hover:bg-green-900/30 transition"
            >
              Pricing Plans
            </Link>
          </div>
        </div>

        {/* Animated mud splatter effect */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-800 opacity-30 rounded-t-full filter blur-md"></div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 lg:px-12 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Enterprise-Grade
            </span> Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaCalendarAlt className="text-4xl mb-4 text-green-500" />,
                title: "Event Management",
                desc: "Full lifecycle management for offroad events with automated workflows."
              },
              {
                icon: <FaUsers className="text-4xl mb-4 text-green-500" />,
                title: "Participant System",
                desc: "Comprehensive participant tracking with safety monitoring."
              },
              {
                icon: <FaMapMarkedAlt className="text-4xl mb-4 text-green-500" />,
                title: "Route Planning",
                desc: "Advanced GPS route planning with terrain analysis."
              },
              {
                icon: <FaChartLine className="text-4xl mb-4 text-green-500" />,
                title: "Real-time Analytics",
                desc: "Dashboard with live event metrics and performance data."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-900 p-8 rounded-xl hover:bg-gray-850 transition border border-gray-700 hover:border-green-500/30">
                {feature.icon}
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-br from-gray-900 via-green-900/50 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Offroad Events?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join hundreds of adventure companies managing their events with OffroadX.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-gradient-to-r from-green-600 to-green-700 px-10 py-4 rounded-full font-bold hover:from-green-500 hover:to-green-600 transition-all shadow-lg hover:shadow-green-500/30 text-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaMapMarkedAlt className="text-green-500 text-2xl" />
              <span className="text-2xl font-bold">OffroadX</span>
            </div>
            <p className="text-gray-400">
              The premium SaaS platform for offroad adventure management.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-400 hover:text-green-400 transition">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-green-400 transition">Pricing</Link></li>
              <li><Link to="/integrations" className="text-gray-400 hover:text-green-400 transition">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-gray-400 hover:text-green-400 transition">Blog</Link></li>
              <li><Link to="/guides" className="text-gray-400 hover:text-green-400 transition">Guides</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-green-400 transition">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-green-400 transition">About</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-green-400 transition">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-green-400 transition">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © 2025 OffroadXperience. All rights reserved. Built for adventurers, by adventurers.
        </div>
      </footer>
    </div>
  )
}

export default App