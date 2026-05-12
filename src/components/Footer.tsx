import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h2>Zovex</h2>
          <p>
            Clean, e-commerce platform for customers, sellers, and
            administrators.
          </p>
        </div>
        <div>
          <h3>Contact us</h3>
          <p>
            <Mail size={16} />
            support@zovex.com
          </p>
          <p>
            <Phone size={16} />
            +94 77 000 0000
          </p>
          <p>
            <MapPin size={16} />
            Sri Lanka
          </p>
        </div>
        <div>
          <h3>Project</h3>
          <p>e-commerce platform</p>
          <p>Designed by Udara Sandaruwan</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Zovex. All rights reserved.</span>
      </div>
    </footer>
  );
}
