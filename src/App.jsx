import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React from "react";
import { router } from "@/router/index.jsx";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;