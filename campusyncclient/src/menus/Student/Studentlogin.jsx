import React, { useState } from "react";
// import './studlogin.css';
import { RiGraduationCapLine } from "react-icons/ri";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useNavigate } from "react-router-dom"; // Added EyeOff for better UX

function Studentlogin() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          
          {/* Back Button */}
          <p className="text-muted mb-4" style={{ cursor: "pointer" }}>
            <small>← Back to role selection</small>
          </p>

          <div className="card border-0 shadow-sm p-4">
            <div className="card-body">
              
              {/* Title Section */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" 
                     style={{ width: "50px", height: "50px" }}>
                  <RiGraduationCapLine size={25} className="text-primary" />
                </div>
                <div>
                  <h2 className="h4 mb-0 fw-bold">Student Login</h2>
                  <p className="text-muted small mb-0">Enter your credentials to continue</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="mb-3">
                <label className="form-label fw-medium">Register Number</label>
                <input
                  type="text"
                  className="form-control form-control-lg fs-6"
                  placeholder="Register Number (e.g. CSE109)"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg fs-6 border-end-0"
                    placeholder="Enter your password"
                  />
                  <span 
                    className="input-group-text bg-white border-start-0 text-muted" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? <LuEyeOff /> : <LuEye />}
                  </span>
                </div>
              </div>

              <button className="btn btn-primary w-100 py-2 fw-bold mb-3 shadow-sm"
              onClick={() => navigate("/student/dashboard")}>
                Sign In →
              </button>

              <p className="text-center text-muted small">
                Demo ID: <b>CSE001</b> · Any password
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studentlogin;