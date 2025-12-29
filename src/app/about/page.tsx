import Image from "next/image";
import founder1 from "./founder1.jpg";
import founder2 from "./founder2.jpg";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About</h1>
        <p className="text-xl text-gray-600">Helping our campus community reconnect with their belongings</p>
      </div>

      <div className="bg-white rounded-apple shadow-apple p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Our mission is to build a unified system that keeps a record of all lost items and their claim history so owners and campus staff can easily see who claimed a product and when. We have gamified interactions to encourage reporting, verifying, and returning items, making the platform friendly and engaging. Built on Next.js, the site is fast, reliable, and simple to use on any device.
        </p>
      </div>

      <div className="bg-white rounded-apple shadow-apple p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Meet the Founders</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="text-center">
            <Image
              src={founder1}
              alt="Founder 1"
              width={140}
              height={140}
              className="rounded-full object-cover"
            />

            <p className="text-sm text-gray-500">Co‑founder</p><br></br>
             <p className="text-sm text-gray-500">Wenuja Liyanamana</p>


          </div>

          <div className="text-center">
            <Image
              src={founder2}
              alt="Founder 2"
              width={140}
              height={140}
              className="rounded-full object-cover"
            />

            <p className="text-sm text-gray-500">Co‑founder</p>
            <br></br>
             <p className="text-sm text-gray-500">Ramiru Wanigathunga</p>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 rounded-apple p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
        <p className="text-gray-700 mb-6">
          Let's make a community that help each other to find lost items
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/post/new"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Post a Found Item
          </a>
          <a
            href="/"
            className="bg-white hover:bg-gray-50 text-primary-600 px-6 py-3 rounded-lg font-medium transition-colors border-2 border-primary-500"
          >
            Browse Feed
          </a>
          <a
            href="/founders"
            className="bg-white hover:bg-gray-50 text-primary-600 px-6 py-3 rounded-lg font-medium transition-colors border-2 border-primary-500"
          >
            Meet the Founders
          </a>
        </div>
      </div>
    </div>
  );
}
