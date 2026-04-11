import React from "react";
import { Nav } from "react-bootstrap";
import { FaBook, FaChartBar , FaExclamationTriangle, FaSignOutAlt } from "react-icons/fa";
import { MdAssignment } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { LuGraduationCap } from "react-icons/lu";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import './Headersec.css';

export default function StudentHeader() {
   const navigate = useNavigate();
    const handleSignOut = () => {
      console.log("Signing out...");
      navigate("/"); // Redirects to login
    };
  return (
    <div id="studentheader" className="sidebar-wrapper bg-dark text-white d-flex flex-column" style={{ width: '280px', height: '100vh' }}>
      
      
      <div className="p-4 d-flex align-items-center gap-3">
        <div className="bg-primary rounded d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', fontSize: '24px' }}>
          <LuGraduationCap />
        </div>
        <div>
          <h5 className="mb-0 fw-bold">Campusync</h5>
          <small className="text-secondary">Student Portal</small>
        </div>
      </div>

      <hr className="mx-3 my-0 border-secondary" />



<Nav className="flex-column flex-grow-1 px-3 mt-3">
  

      
        <Nav.Link as={Link} to="/student/dashboard" className="nav-link-custom mb-2 d-flex align-items-center gap-3 p-2 rounded text-white">
          <RxDashboard size={20} /> Dashboard
        </Nav.Link>

        <Nav.Link as={Link} to="/student/applyleave" className="nav-link-custom mb-2 d-flex align-items-center gap-3 p-2 rounded text-white">
          <MdAssignment size={20} /> Apply Leave
        </Nav.Link>

        <Nav.Link as={Link} to="/student/applyod" className="nav-link-custom mb-2 d-flex align-items-center gap-3 p-2 rounded text-white">
           <FaBook size={20} /> Apply OD
        </Nav.Link>

        <Nav.Link as={Link} to="/student/issues" className="nav-link-custom mb-2 d-flex align-items-center gap-3 p-2 rounded text-white">
           <FaExclamationTriangle size={20} /> Report Issue
        </Nav.Link>

        <Nav.Link as={Link} to="/student/attendance" className="nav-link-custom mb-2 d-flex align-items-center gap-3 p-2 rounded text-white">
           <FaChartBar size={20} /> Attendance
        </Nav.Link>

        
        
        
        <Nav.Link as={Link} to="/student/cgpa" className="nav-link-custom mb-2 d-flex align-items-center gap-3 p-2 rounded text-white">
           <FaExclamationTriangle size={20} /> CGPA Calculator
        </Nav.Link>
      </Nav>






      

      {/* Bottom Section */}
      <div className="mt-auto p-3 border-top border-secondary">
        <div className="px-2 mb-3">
          <h6 className="mb-0">Arun Kumar</h6>
          <small className="text-secondary">Computer Science</small>
        </div>
        
       <button 
                 className="btn btn-outline-danger w-100 d-flex align-items-center gap-3 border-0 text-start ps-2"
                 onClick={handleSignOut}
                 style={{ transition: '0.3s' }}
               >
                 <FaSignOutAlt /> Sign Out
               </button>
      </div>
    </div>
  );
}