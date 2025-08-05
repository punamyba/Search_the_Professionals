import type { JSX } from "react";
import { Navigate } from "react-router-dom";


interface RoleGuardProps {
    allowedRoles: string[];
    children: JSX.Element;
}

const RoleGuard = ({allowedRoles, children}: RoleGuardProps) => {
 const user = JSON.parse(localStorage.getItem ("currentUser") || "null");
 const token = localStorage.getItem ('token');

 if (!token || !user ){
  return<Navigate to="/login" replace />;
 }

 if(!allowedRoles.includes(user.role)){
    return<Navigate to="/notfound" replace />;
 }
 return children;
};

export default RoleGuard;