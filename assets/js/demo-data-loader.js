/**
 * Demo Data Loader for NagrikNeeti
 * Loads sample candidates, promises, and feedback into Firestore
 * Run this ONCE to populate test data
 * 
 * Usage: Open browser console and run:
 * import('./demo-data-loader.js').then(m => m.loadDemoData());
 */

import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from "../../../firebase/firebase-config.js";

const DEMO_CANDIDATES = [
  {
    name: "Raj Kumar Singh",
    party: "National Democratic Alliance",
    constituency: "Delhi Central",
    education: "B.Tech from IIT Delhi",
    email: "raj.kumar@example.com",
    phone: "9876543210",
    transparencyScore: 85,
    fundsAllocated: 50000000,
    fundsUtilized: 42500000,
    pastPerformance: ["Mayor, Municipal Corp (2015-2020)", "Councilor, South Delhi (2010-2015)"],
    criminalCases: [],
    assets: { total: 12500000, details: ["House worth 5Cr", "Car worth 25L"] },
    liabilities: { total: 2000000, details: ["Home loan: 20L"] }
  },
  {
    name: "Priya Sharma",
    party: "Indian National Congress",
    constituency: "Mumbai North",
    education: "M.A. Economics from Delhi University",
    email: "priya.sharma@example.com",
    phone: "9876543211",
    transparencyScore: 78,
    fundsAllocated: 45000000,
    fundsUtilized: 38250000,
    pastPerformance: ["State Assembly Member (2014-2019)", "Social Worker (2008-2014)"],
    criminalCases: [],
    assets: { total: 8500000, details: ["Apartment worth 2.5Cr"] },
    liabilities: { total: 1500000, details: ["Car loan: 15L"] }
  },
  {
    name: "Amit Patel",
    party: "Bharatiya Janata Party",
    constituency: "Bangalore South",
    education: "MBA from ISB Hyderabad",
    email: "amit.patel@example.com",
    phone: "9876543212",
    transparencyScore: 92,
    fundsAllocated: 55000000,
    fundsUtilized: 52250000,
    pastPerformance: ["Business magnate", "Philanthropist (2010-present)"],
    criminalCases: [],
    assets: { total: 25000000, details: ["Real estate portfolio", "Business shares"] },
    liabilities: { total: 5000000 }
  },
  {
    name: "Neha Verma",
    party: "Aam Aadmi Party",
    constituency: "Delhi South",
    education: "B.A. Political Science from Delhi University",
    email: "neha.verma@example.com",
    phone: "9876543213",
    transparencyScore: 88,
    fundsAllocated: 40000000,
    fundsUtilized: 36000000,
    pastPerformance: ["Activist", "NGO Founder"],
    criminalCases: [],
    assets: { total: 4500000 },
    liabilities: { total: 1000000 }
  },
  {
    name: "Vikram Desai",
    party: "All India Majlis-e-Ittehadul Muslimeen",
    constituency: "Hyderabad",
    education: "Law degree from Osmania University",
    email: "vikram.desai@example.com",
    phone: "9876543214",
    transparencyScore: 72,
    fundsAllocated: 35000000,
    fundsUtilized: 28000000,
    pastPerformance: ["Lawyer (2005-2020)"],
    criminalCases: ["Case dismissed 2015"],
    assets: { total: 6500000 },
    liabilities: { total: 2500000 }
  }
];

const DEMO_PROMISES = [
  {
    candidateId: 0,
    title: "Build 100 new schools in rural areas",
    description: "Construct modern schools with quality infrastructure in 5 rural districts",
    category: "education",
    status: "in-progress",
    completionPercentage: 65,
    completionDate: new Date("2026-06-30"),
    proofLinks: ["https://example.com/school-1", "https://example.com/school-2"]
  },
  {
    candidateId: 0,
    title: "Reduce pollution by 40%",
    description: "Implement electric public transport and green initiatives",
    category: "environment",
    status: "planned",
    completionPercentage: 0,
    completionDate: new Date("2027-12-31"),
    proofLinks: []
  },
  {
    candidateId: 1,
    title: "Create 10,000 new jobs",
    description: "Support startups and small businesses through funding and mentorship",
    category: "employment",
    status: "in-progress",
    completionPercentage: 55,
    completionDate: new Date("2026-09-30"),
    proofLinks: ["https://example.com/jobs-report"]
  },
  {
    candidateId: 1,
    title: "Improve healthcare access in villages",
    description: "Set up 50 health clinics in remote areas",
    category: "healthcare",
    status: "completed",
    completionPercentage: 100,
    completionDate: new Date("2025-12-15"),
    proofLinks: ["https://example.com/health-clinics"]
  },
  {
    candidateId: 2,
    title: "Build 5 highways",
    description: "Connect major cities with modern infrastructure",
    category: "infrastructure",
    status: "in-progress",
    completionPercentage: 72,
    completionDate: new Date("2026-08-30"),
    proofLinks: ["https://example.com/highways"]
  },
  {
    candidateId: 3,
    title: "Support farmers with subsidy",
    description: "Provide direct cash support and modern farming techniques",
    category: "agriculture",
    status: "planned",
    completionPercentage: 20,
    completionDate: new Date("2027-03-30"),
    proofLinks: []
  }
];

const DEMO_FEEDBACK = [
  {
    candidateId: 0,
    userId: "demo-user-1",
    userName: "Rahul K.",
    feedbackText: "Great work on education initiatives. More transparency needed in fund allocation.",
    rating: 4,
    isPositive: true,
    verified: true
  },
  {
    candidateId: 0,
    userId: "demo-user-2",
    userName: "Anjali M.",
    feedbackText: "Mixed results. Some promises delivered, others pending for too long.",
    rating: 3,
    isPositive: false,
    verified: true
  },
  {
    candidateId: 1,
    userId: "demo-user-3",
    userName: "Suresh R.",
    feedbackText: "Excellent healthcare initiative. Directly benefited from the new health clinic.",
    rating: 5,
    isPositive: true,
    verified: true
  },
  {
    candidateId: 2,
    userId: "demo-user-4",
    userName: "Priya S.",
    feedbackText: "Infrastructure projects are impressive but delayed in some areas.",
    rating: 4,
    isPositive: true,
    verified: true
  },
  {
    candidateId: 3,
    userId: "demo-user-5",
    userName: "Mohan L.",
    feedbackText: "Strong focus on social welfare. Highly transparent and accessible.",
    rating: 5,
    isPositive: true,
    verified: true
  }
];

/**
 * Load demo data into Firestore
 */
export async function loadDemoData() {
  try {
    console.log("🚀 Starting demo data loader...");

    // Load candidates
    console.log("📝 Loading candidates...");
    const candidateIds = [];
    for (const candidate of DEMO_CANDIDATES) {
      const docRef = await addDoc(collection(db, "candidates"), {
        ...candidate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      candidateIds.push(docRef.id);
      console.log(`✅ Added candidate: ${candidate.name}`);
    }

    // Load promises
    console.log("📋 Loading promises...");
    for (const promise of DEMO_PROMISES) {
      const actualCandidateId = candidateIds[promise.candidateId];
      await addDoc(collection(db, "promises"), {
        ...promise,
        candidateId: actualCandidateId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ Added ${DEMO_PROMISES.length} promises`);

    // Load feedback
    console.log("💬 Loading feedback...");
    for (const feedback of DEMO_FEEDBACK) {
      const actualCandidateId = candidateIds[feedback.candidateId];
      await addDoc(collection(db, "feedback"), {
        ...feedback,
        candidateId: actualCandidateId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ Added ${DEMO_FEEDBACK.length} feedback items`);

    console.log("✨ Demo data loaded successfully!");
    console.log("📊 Reload the page to see candidates");
    alert("✅ Demo data loaded! Please refresh the page.");
  } catch (error) {
    console.error("❌ Error loading demo data:", error);
    alert("Error: " + error.message);
  }
}

// Auto-run on import (optional - comment out if you want manual control)
console.log("💡 Demo data loader ready. Run: loadDemoData()");
