import {
  useEffect,
  useState,
} from 'react';

import { Navigate } from 'react-router-dom';

import axiosInstance from '../../utils/axiosInstance';

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking, ok, unauth

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axiosInstance.get("/auth/check");
        if (res.data?.loggedIn) setStatus("ok");
        else setStatus("unauth");
      } catch {
        setStatus("unauth");
      }
    };
    checkSession();
  }, []);

  if (status === "checking") return <div>Loading...</div>;
  if (status === "unauth") return <Navigate to="/" replace />;
  return children;
}
