"use client";
import { useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();

  useEffect(() => {
    user && CreateNewUser();
  }, [user]);

  const CreateNewUser = async () => {
    const result = await axios.post("/api/users");
    console.log(result.data);
  };

  return <div>{children}</div>;
}

export default Provider;
