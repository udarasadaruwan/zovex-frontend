import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductList from "./ProductList";
import Button from "../components/ui/Button";
import heroImage from "../assets/zovex-home-image.svg";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Zovex marketplace</p>
          <h1>Shop smarter. Sell faster. Manage everything clearly.</h1>
          <p>
            Zovex is a clean e-commerce platform for customers, sellers, and
            administrators with secure account access, product management, cart
            workflows, and role-based dashboards.
          </p>
          <div className="hero-actions">
            <Button as={Link} to="/products">
              Shop products
              <ArrowRight size={18} />
            </Button>
            <Button as={Link} to="/register" variant="secondary">
              Create account
            </Button>
          </div>
        </div>
        <div className="hero-media" aria-label="Zovex marketplace preview">
          <img src="/public/Hero.png" alt="Zovex shopping interface preview" />
        </div>
      </section>

      <ProductList compact />

      <section className="contact-section" id="contact">
        <div>
          <p className="eyebrow">Contact us</p>
          <h2>Need help with Zovex?</h2>
          <p>
            Reach out for account support, seller onboarding, order questions,
            or admin assistance. The platform is designed by Udara Sandaruwan.
          </p>
        </div>
        <div className="contact-card">
          <strong>Email</strong>
          <span>support@zovex.local</span>
          <strong>Phone</strong>
          <span>+94 77 000 0000</span>
          <strong>Location</strong>
          <span>Sri Lanka</span>
        </div>
      </section>
    </>
  );
}
