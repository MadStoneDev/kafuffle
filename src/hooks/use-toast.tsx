// hooks/use-toast.tsx
import toast, { Toaster } from "react-hot-toast";
import React from "react";

// Custom toast wrapper for consistent API
export const useToast = () => {
  return {
    toast: {
      // Success toast
      success: (message: string, options?: any) => {
        return toast.success(message, {
          duration: 4000,
          position: "top-right",
          ...options,
        });
      },

      // Error toast
      error: (message: string, options?: any) => {
        return toast.error(message, {
          duration: 4000,
          position: "top-right",
          ...options,
        });
      },

      // Info/default toast
      info: (message: string, options?: any) => {
        return toast(message, {
          duration: 4000,
          position: "top-right",
          ...options,
        });
      },

      // Loading toast
      loading: (message: string, options?: any) => {
        return toast.loading(message, {
          position: "top-right",
          ...options,
        });
      },

      // Promise toast
      promise: <T,>(
        promise: Promise<T>,
        msgs: {
          loading: string;
          success: string;
          error: string;
        },
        options?: any,
      ) => {
        return toast.promise(promise, msgs, {
          position: "top-right",
          ...options,
        });
      },

      // Dismiss toast
      dismiss: (toastId?: string) => {
        if (toastId) {
          toast.dismiss(toastId);
        } else {
          toast.dismiss();
        }
      },

      // Custom toast with more control - FIXED
      custom: (
        content: React.ReactNode | ((t: any) => React.ReactNode),
        options?: any,
      ) => {
        // If content is already a function, use it directly
        if (typeof content === "function") {
          return toast.custom(content, {
            duration: 4000,
            position: "top-right",
            ...options,
          });
        }

        // Otherwise, wrap the ReactNode in a function
        return toast.custom(() => content, {
          duration: 4000,
          position: "top-right",
          ...options,
        });
      },
    },
  };
};

// Export the Toaster component for use in root layout
export { Toaster } from "react-hot-toast";

// Styled Toaster component with custom styling
export const StyledToaster = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,

        // Styling
        style: {
          background: "#363636",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
        },

        // Success toast styling
        success: {
          style: {
            background: "#10B981",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        },

        // Error toast styling
        error: {
          style: {
            background: "#EF4444",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        },

        // Loading toast styling
        loading: {
          style: {
            background: "#6366F1",
          },
        },
      }}
    />
  );
};
