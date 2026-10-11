"use client";

import React from "react";
import UserHeader from "./user-header";

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div>
      <UserHeader />
      <main>{children}</main>
    </div>
  );
};

export default UserLayout;