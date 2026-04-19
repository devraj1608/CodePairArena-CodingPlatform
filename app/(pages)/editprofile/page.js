"use client";
import React, { useState } from "react";
import { updateUserAvatar } from "../../../Services/Auth.service";
import { useRouter } from "next/navigation";
import CodingBackground from "../../../Components/CodingBackground";

const EditProfile = () => {
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const router = useRouter();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) return;

    const formData = new FormData();
    formData.append("avatar", avatar);

    try {
      const response = await updateUserAvatar(formData);
      if (response) {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
    }
  };

  return (
    <>
      <CodingBackground />

      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="bg-gray-800/90 backdrop-blur-md p-10 md:p-16 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700">
          <h2 className="text-4xl font-extrabold mb-10 text-center text-gray-100 tracking-tight">
            Update Your Avatar
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="h-52 w-52 rounded-full mb-5 object-cover shadow-xl border-2 border-gray-600"
                />
              ) : (
                <div className="h-52 w-52 rounded-full bg-gray-700 flex items-center justify-center mb-5 shadow-inner border-2 border-gray-600">
                  <span className="text-gray-400 text-lg font-medium">No Avatar</span>
                </div>
              )}

              <label
                htmlFor="avatar"
                className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-3 px-6 rounded-full cursor-pointer transition duration-300 ease-in-out shadow-md"
              >
                Choose Avatar
              </label>
              <input
                type="file"
                id="avatar"
                className="hidden"
                onChange={handleAvatarChange}
                accept="image/*"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-bold py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300"
            >
              Update Avatar
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Make sure your avatar is appropriate and professional.
          </p>
        </div>
      </div>
    </>
  );
};

export default EditProfile;