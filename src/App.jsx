import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaUsers, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

function App() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Floating 3D geometric shapes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-600/5 rounded-3xl transform rotate-45 animate-[float_6s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-tl from-orange-400/8 to-yellow-500/3 rounded-2xl transform -rotate-12 animate-[float_8s_ease-in-out_infinite_reverse] blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-amber-500/6 to-orange-600/4 rounded-full transform animate-[float_10s_ease-in-out_infinite] blur-md"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-bl from-orange-300/12 to-amber-400/6 rounded-xl transform rotate-12 animate-[float_7s_ease-in-out_infinite_reverse] blur-sm"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Premium gradient background with 3D depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-stone-900 opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/20 via-transparent to-orange-950/10"></div>
        
        {/* Navigation */}
        <nav className="relative z-20 py-8 px-8 lg:px-16 flex justify-between items-center backdrop-blur-xl bg-black/30 border-b border-stone-800/50">
          <div className="flex items-center space-x-4 group">
            <div className="relative">
              <FaMapMarkedAlt className="text-orange-500 text-3xl transform group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 drop-shadow-2xl tracking-tight">
              OffroadX
            </span>
          </div>
           
          <div>
            <Link 
              to="/login" 
              className="relative group bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-3 rounded-2xl font-semibold tracking-wide text-white transform hover:scale-105 transition-all duration-500 shadow-[0_8px_32px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.5)] border border-orange-500/20 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-20 py-48 px-8 lg:px-16 text-center">
          <div className="relative">
            {/* 3D text shadow layers */}
            <h1 className="text-6xl md:text-8xl font-black mb-12 leading-[0.9] relative">
              <div className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-stone-700 to-stone-800 transform translate-x-2 translate-y-2 blur-sm">
                Revolutionizing Offroad Adventures
              </div>
              <div className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-stone-600 to-stone-700 transform translate-x-1 translate-y-1">
                Revolutionizing Offroad Adventures
              </div>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                Revolutionizing
              </span>
              <span className="relative text-white drop-shadow-2xl"> Offroad Adventures</span>
            </h1>
          </div>
          
          <div className="relative mb-16">
            <p className="text-xl md:text-2xl text-stone-300 max-w-4xl mx-auto leading-relaxed font-light tracking-wide">
              The ultimate SaaS platform for offroad event management, participant engagement, and adventure analytics.
            </p>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <Link 
              to="/demo" 
              className="group relative bg-black/80 text-white px-12 py-5 rounded-2xl font-semibold backdrop-blur-xl border border-stone-700/50 hover:border-orange-500/50 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.2)] transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 tracking-wide">Request Demo</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Link>
            <Link 
              to="/pricing" 
              className="group relative border-2 border-orange-500/60 text-orange-400 px-12 py-5 rounded-2xl font-semibold hover:bg-orange-500/10 transition-all duration-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 tracking-wide">Pricing Plans</span>
            </Link>
          </div>
        </div>

        {/* 3D depth layers */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-900/60 via-stone-800/30 to-transparent rounded-t-[3rem] backdrop-blur-sm"></div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent rounded-t-[2rem]"></div>
      </div>

      {/* Features Section */}
      <div className="relative py-40 px-8 lg:px-16 bg-gradient-to-b from-stone-950 via-neutral-950 to-black">
        {/* Background 3D elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-amber-600/3 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-tl from-amber-500/4 to-orange-600/2 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_reverse]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                Enterprise-Grade
              </span>
              <span className="text-white"> Features</span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaCalendarAlt className="text-5xl mb-8 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />,
                title: "Event Management",
                desc: "Full lifecycle management for offroad events with automated workflows."
              },
              {
                icon: <FaUsers className="text-5xl mb-8 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />,
                title: "Participant System",
                desc: "Comprehensive participant tracking with safety monitoring."
              },
              {
                icon: <FaMapMarkedAlt className="text-5xl mb-8 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />,
                title: "Route Planning",
                desc: "Advanced managment of laps recording."
              },
              {
                icon: <FaChartLine className="text-5xl mb-8 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />,
                title: "Real-time Analytics",
                desc: "Dashboard with live event metrics and performance data."
              }
            ].map((feature, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-stone-900/80 to-neutral-900/60 p-8 rounded-3xl backdrop-blur-xl border border-stone-700/50 hover:border-orange-500/40 transition-all duration-700 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(249,115,22,0.1)] transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
                {/* 3D card background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative z-10">
                  <div className="relative mb-6">
                    {feature.icon}
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-orange-100 transition-colors duration-500">{feature.title}</h3>
                  <p className="text-stone-400 leading-relaxed group-hover:text-stone-300 transition-colors duration-500">{feature.desc}</p>
                </div>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-40 px-8 bg-gradient-to-br from-black via-stone-950 to-neutral-950 overflow-hidden">
        {/* 3D background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/8 to-amber-600/4 rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-2xl transform rotate-45 animate-[float_8s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-tl from-amber-500/8 to-transparent rounded-xl transform -rotate-12 animate-[float_12s_ease-in-out_infinite_reverse] blur-sm"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="relative mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="text-white">Ready to </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                Transform
              </span>
              <span className="text-white"> Your Offroad Events?</span>
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"></div>
          </div>
          
          <p className="text-2xl text-stone-300 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Join hundreds of adventure companies managing their events with OffroadX.
          </p>
          
          <div className="relative inline-block">
            <Link 
              to="/signup" 
              className="group relative inline-block bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-16 py-6 rounded-2xl font-bold text-lg tracking-wide text-white transform hover:scale-110 transition-all duration-500 shadow-[0_12px_48px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_60px_rgba(249,115,22,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
              <span className="relative z-10">Start Free Trial</span>
              
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-orange-400/50 group-hover:border-orange-300/80 transition-colors duration-500"></div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-black py-20 px-8 border-t border-stone-800/50 overflow-hidden">
        {/* 3D footer background */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-neutral-950 to-black"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-xl animate-[float_15s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-tl from-amber-500/8 to-transparent rounded-lg blur-lg animate-[float_12s_ease-in-out_infinite_reverse]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-4 mb-8 group">
                <div className="relative">
                  <FaMapMarkedAlt className="text-orange-500 text-3xl transform group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                </div>
                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600">
                  OffroadX
                </span>
              </div>
              <p className="text-stone-400 leading-relaxed text-lg">
                The premium SaaS platform for offroad adventure management.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-8 text-white relative">
                Product
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              </h4>
              <ul className="space-y-4">
                <li><Link to="/features" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Features</Link></li>
                <li><Link to="/pricing" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Pricing</Link></li>
                <li><Link to="/integrations" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-8 text-white relative">
                Resources
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              </h4>
              <ul className="space-y-4">
                <li><Link to="/blog" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Blog</Link></li>
                <li><Link to="/guides" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Guides</Link></li>
                <li><Link to="/support" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-8 text-white relative">
                Company
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              </h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">About</Link></li>
                <li><Link to="/careers" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Careers</Link></li>
                <li><Link to="/contact" className="text-stone-400 hover:text-orange-400 transition-all duration-300 hover:translate-x-1 inline-block">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-stone-800/50 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            </div>
            <p className="text-stone-500 text-sm tracking-wide">
              © 2025 OffroadXperience. All rights reserved. Built for adventurers, by adventurers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App