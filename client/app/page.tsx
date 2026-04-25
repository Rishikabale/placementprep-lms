import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white h-screen w-full overflow-hidden flex flex-col">
      {/* Navbar Placeholder (if not global) or spacer */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Placement<span className="text-indigo-600">LMS</span></span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">Log in</Link>
          <Link href="/register" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Get started</Link>
        </div>
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 h-full">
        {/* Left Content */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 h-full relative z-0">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>

          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 w-fit">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            <span className="text-xs font-medium text-indigo-700">New: AI Mock Interview Engine</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Master Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Placement Journey</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
            The only AI-powered platform that adapts to your skills. comprehensive video courses, intelligent mock tests, and real-time career analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-base">
              Start Learning Free <span>→</span>
            </Link>
            <Link href="/login" className="px-8 py-3 rounded-md bg-white text-gray-700 font-semibold border border-gray-200 hover:bg-gray-50 flex items-center justify-center shadow-sm transition-all hover:border-gray-300">
              Student Login
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center gap-8 text-gray-500 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Adaptive Tests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Video Content</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Career Insights</span>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="hidden lg:flex relative bg-gray-50 items-center justify-center h-full overflow-hidden">

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-60"></div>

          {/* UI Mockup Placeholder / Composition */}
          <div className="relative z-10 w-[85%] max-w-lg aspect-[4/3] perspective-1000">
            <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
              {/* Fake Header */}
              <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              {/* Fake Content: Dashboard Preview */}
              <div className="p-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 w-48 bg-indigo-100 rounded"></div>
                  </div>
                  <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="h-24 bg-gray-50 rounded-xl border border-gray-100 p-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-24 bg-gray-50 rounded-xl border border-gray-100 p-3">
                    <div className="h-8 w-8 bg-green-100 rounded-lg mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
                  <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                A+
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Placement Readiness</p>
                <p className="text-lg font-bold text-gray-900">High (85%)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
