import React from "react";

const Notification = ({ notification }) => {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium transition-transform transform ${
        notification.type === "success"
          ? "bg-green-600 animate-slideIn"
          : "bg-red-600 animate-slideIn"
      }`}
    >
      <span className="text-xl">
        {notification.type === "success" ? "✅" : "⚠️"}
      </span>
      <span>{notification.message}</span>
    </div>
  );
};

export default Notification;