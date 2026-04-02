"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await fetch("/api/support", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    alert("Message sent successfully!");

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      <h1 className="text-4xl font-bold text-center mb-8">
        Contact Support
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Have questions about courses or facing issues? Send us a message.
      </p>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Support Information</h2>

          <div>
            <p className="font-medium">Email</p>
            <p className="text-gray-600">support@lms.com</p>
          </div>

          <div>
            <p className="font-medium">Phone</p>
            <p className="text-gray-600">+91 98765 43210</p>
          </div>

          <div>
            <p className="font-medium">Working Hours</p>
            <p className="text-gray-600">Mon - Fri : 9AM - 6PM</p>
          </div>

          <div>
            <p className="font-medium">Address</p>
            <p className="text-gray-600">
              LMS Learning Pvt Ltd <br/>
              India
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-white/5 border dark:border-white/10 shadow-md rounded-lg p-6 space-y-4"
        >

          <div>
            <label className="block mb-1 font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Message
            </label>
            <textarea
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium 
                       hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black 
                       transition bg-orange-600 text-white hover:bg-orange-700"
          >
            Send Message
          </button>

        </form>
      </div>
    </div>
  );
}